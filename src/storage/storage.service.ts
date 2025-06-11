import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { S3Service, StorageBucket, UploadOptions, SignedUrlOptions } from './s3.service';
import { FileValidationService, ValidationResult } from './file-validation.service';
import { ImageOptimizationService, OptimizationResult } from './image-optimization.service';

export interface FileUploadResult {
  originalUrl: string;
  optimizedUrls?: Record<string, string>;
  metadata: {
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
    bucket: StorageBucket;
    key: string;
  };
  validation: ValidationResult;
  optimization?: Record<string, OptimizationResult>;
}

export interface BulkUploadResult {
  successful: FileUploadResult[];
  failed: Array<{ file: Express.Multer.File; error: string }>;
}

export interface UploadConfiguration {
  bucket: StorageBucket;
  fileType: 'image' | 'sketch' | 'document' | 'video';
  generateSizes?: boolean;
  sizes?: string[];
  prefix?: string;
  customValidation?: any;
  enableOptimization?: boolean;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly fileValidationService: FileValidationService,
    private readonly imageOptimizationService: ImageOptimizationService,
  ) {}

  /**
   * Upload a single file with validation and optimization
   */
  async uploadFile(
    file: Express.Multer.File,
    config: UploadConfiguration
  ): Promise<FileUploadResult> {
    try {
      // Validate the file
      const validation = this.fileValidationService.validateFile(
        file,
        config.fileType,
        config.customValidation
      );

      if (!validation.isValid) {
        throw new BadRequestException(validation.error);
      }

      // Generate safe filename
      const safeFileName = this.fileValidationService.generateSafeFilename(
        file.originalname,
        config.prefix
      );

      // Upload original file
      const uploadOptions: UploadOptions = {
        bucket: config.bucket,
        key: safeFileName,
        body: file.buffer,
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
          fileType: config.fileType,
        },
      };

      const originalUrl = await this.s3Service.uploadFile(uploadOptions);

      const result: FileUploadResult = {
        originalUrl,
        metadata: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          uploadedAt: new Date(),
          bucket: config.bucket,
          key: safeFileName,
        },
        validation,
      };

      // Handle image optimization if enabled and file is an image
      if (
        config.enableOptimization !== false &&
        (config.fileType === 'image' || config.fileType === 'sketch') &&
        this.isImageFile(file.mimetype)
      ) {
        const optimizationResults = await this.processImageOptimization(
          file.buffer,
          config,
          safeFileName
        );
        
        result.optimization = optimizationResults.optimization;
        result.optimizedUrls = optimizationResults.urls;
      }

      this.logger.log(`File uploaded successfully: ${safeFileName} to ${config.bucket}`);
      return result;
    } catch (error) {
      this.logger.error(`File upload failed for ${file.originalname}:`, error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    config: UploadConfiguration
  ): Promise<BulkUploadResult> {
    const result: BulkUploadResult = {
      successful: [],
      failed: [],
    };

    for (const file of files) {
      try {
        const uploadResult = await this.uploadFile(file, config);
        result.successful.push(uploadResult);
      } catch (error) {
        result.failed.push({
          file,
          error: error.message,
        });
        this.logger.error(`Failed to upload ${file.originalname}:`, error);
      }
    }

    return result;
  }

  /**
   * Delete a file and all its variants
   */
  async deleteFile(bucket: StorageBucket, key: string): Promise<void> {
    try {
      // Delete the original file
      await this.s3Service.deleteFile(bucket, key);

      // Delete optimized versions (if they exist)
      const optimizedSizes = ['thumbnail', 'small', 'medium', 'large'];
      const baseKey = key.replace(/\.[^/.]+$/, ''); // Remove extension
      const extension = key.substring(key.lastIndexOf('.'));

      for (const size of optimizedSizes) {
        try {
          const optimizedKey = `${baseKey}_${size}${extension}`;
          if (await this.s3Service.fileExists(bucket, optimizedKey)) {
            await this.s3Service.deleteFile(bucket, optimizedKey);
          }
        } catch (error) {
          // Log but don't fail if optimized version doesn't exist
          this.logger.warn(`Could not delete optimized version ${size} for ${key}:`, error);
        }
      }

      this.logger.log(`File and variants deleted: ${key} from ${bucket}`);
    } catch (error) {
      this.logger.error(`File deletion failed for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a signed URL for secure file access
   */
  async getSignedUrl(options: SignedUrlOptions): Promise<string> {
    return this.s3Service.generateSignedUrl(options);
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: StorageBucket, key: string): string {
    return this.s3Service.getFileUrl(bucket, key);
  }

  /**
   * Check if a file exists
   */
  async fileExists(bucket: StorageBucket, key: string): Promise<boolean> {
    return this.s3Service.fileExists(bucket, key);
  }

  /**
   * List files in a bucket
   */
  async listFiles(bucket: StorageBucket, prefix?: string, maxKeys?: number): Promise<string[]> {
    return this.s3Service.listFiles(bucket, prefix, maxKeys);
  }

  /**
   * Download a file
   */
  async downloadFile(bucket: StorageBucket, key: string): Promise<Buffer> {
    return this.s3Service.downloadFile(bucket, key);
  }

  /**
   * Initialize storage (create buckets if they don't exist)
   */
  async initializeStorage(): Promise<void> {
    this.logger.log('Initializing storage...');
    
    const buckets = [
      StorageBucket.SKETCHES,
      StorageBucket.PRODUCTS,
      StorageBucket.USER_UPLOADS,
      StorageBucket.GIFTS,
    ];

    for (const bucket of buckets) {
      try {
        await this.s3Service.ensureBucketExists(bucket);
        this.logger.log(`Bucket ${bucket} is ready`);
      } catch (error) {
        this.logger.error(`Failed to initialize bucket ${bucket}:`, error);
        throw error;
      }
    }

    this.logger.log('Storage initialization completed');
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<Record<StorageBucket, { fileCount: number; files: string[] }>> {
    const stats: Record<StorageBucket, { fileCount: number; files: string[] }> = {} as any;

    const buckets = [
      StorageBucket.SKETCHES,
      StorageBucket.PRODUCTS,
      StorageBucket.USER_UPLOADS,
      StorageBucket.GIFTS,
    ];

    for (const bucket of buckets) {
      try {
        const files = await this.s3Service.listFiles(bucket);
        stats[bucket] = {
          fileCount: files.length,
          files: files.slice(0, 10), // Return only first 10 files for preview
        };
      } catch (error) {
        this.logger.error(`Failed to get stats for bucket ${bucket}:`, error);
        stats[bucket] = { fileCount: 0, files: [] };
      }
    }

    return stats;
  }

  /**
   * Process image optimization and upload variants
   */
  private async processImageOptimization(
    buffer: Buffer,
    config: UploadConfiguration,
    originalKey: string
  ): Promise<{ optimization: Record<string, OptimizationResult>; urls: Record<string, string> }> {
    try {
      const sizes = config.sizes || ['thumbnail', 'small', 'medium'];
      const optimization = await this.imageOptimizationService.generateImageSizes(buffer, sizes);
      const urls: Record<string, string> = {};

      // Upload each optimized version
      for (const [sizeName, result] of Object.entries(optimization)) {
        const baseKey = originalKey.replace(/\.[^/.]+$/, ''); // Remove extension
        const extension = this.getOptimizedExtension(result);
        const optimizedKey = `${baseKey}_${sizeName}${extension}`;

        const uploadOptions: UploadOptions = {
          bucket: config.bucket,
          key: optimizedKey,
          body: result.buffer,
          contentType: this.getContentTypeForFormat(result.info.format),
          metadata: {
            originalKey,
            size: sizeName,
            optimizedAt: new Date().toISOString(),
            compressionRatio: result.compressionRatio.toString(),
          },
        };

        urls[sizeName] = await this.s3Service.uploadFile(uploadOptions);
      }

      return { optimization, urls };
    } catch (error) {
      this.logger.error('Image optimization processing failed:', error);
      throw error;
    }
  }

  /**
   * Check if a MIME type is an image
   */
  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Get file extension for optimized image
   */
  private getOptimizedExtension(result: OptimizationResult): string {
    const formatMap: Record<string, string> = {
      jpeg: '.jpg',
      png: '.png',
      webp: '.webp',
      gif: '.gif',
    };
    
    return formatMap[result.info.format] || '.jpg';
  }

  /**
   * Get content type for image format
   */
  private getContentTypeForFormat(format: string): string {
    const contentTypeMap: Record<string, string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };
    
    return contentTypeMap[format] || 'image/jpeg';
  }
} 