import { Injectable, Logger } from '@nestjs/common';
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '../config/config.service';

export enum StorageBucket {
  SKETCHES = 'sketches',
  PRODUCTS = 'products',
  USER_UPLOADS = 'user-uploads',
  GIFTS = 'gifts',
}

export interface UploadOptions {
  bucket: StorageBucket;
  key: string;
  body: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface SignedUrlOptions {
  bucket: StorageBucket;
  key: string;
  expiresIn?: number; // in seconds, default 3600 (1 hour)
  operation?: 'getObject' | 'putObject';
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketMapping: Record<StorageBucket, string>;

  constructor(private readonly configService: ConfigService) {
    // Initialize S3 client
    this.s3Client = new S3Client({
      region: this.configService.awsRegion,
      credentials: this.configService.awsAccessKeyId && this.configService.awsSecretAccessKey ? {
        accessKeyId: this.configService.awsAccessKeyId,
        secretAccessKey: this.configService.awsSecretAccessKey,
      } : undefined, // Use default credentials if not provided
    });

    // Map bucket types to actual bucket names
    this.bucketMapping = {
      [StorageBucket.SKETCHES]: this.configService.awsS3BucketSketches,
      [StorageBucket.PRODUCTS]: this.configService.awsS3BucketProducts,
      [StorageBucket.USER_UPLOADS]: this.configService.awsS3BucketUserUploads,
      [StorageBucket.GIFTS]: this.configService.awsS3BucketGifts,
    };
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(options: UploadOptions): Promise<string> {
    const bucketName = this.bucketMapping[options.bucket];
    
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        Metadata: options.metadata,
      });

      await this.s3Client.send(command);

      // Return the file URL (CloudFront if available, otherwise S3)
      return this.getFileUrl(options.bucket, options.key);
    } catch (error) {
      this.logger.error(`Failed to upload file to ${bucketName}/${options.key}:`, error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Download a file from S3
   */
  async downloadFile(bucket: StorageBucket, key: string): Promise<Buffer> {
    const bucketName = this.bucketMapping[bucket];
    
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (response.Body) {
        return Buffer.from(await response.Body.transformToByteArray());
      }
      
      throw new Error('No file content received');
    } catch (error) {
      this.logger.error(`Failed to download file from ${bucketName}/${key}:`, error);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(bucket: StorageBucket, key: string): Promise<void> {
    const bucketName = this.bucketMapping[bucket];
    
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted: ${bucketName}/${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from ${bucketName}/${key}:`, error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(bucket: StorageBucket, key: string): Promise<boolean> {
    const bucketName = this.bucketMapping[bucket];
    
    try {
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      this.logger.error(`Failed to check file existence in ${bucketName}/${key}:`, error);
      throw new Error(`File check failed: ${error.message}`);
    }
  }

  /**
   * Generate a signed URL for secure file access
   */
  async generateSignedUrl(options: SignedUrlOptions): Promise<string> {
    const bucketName = this.bucketMapping[options.bucket];
    const expiresIn = options.expiresIn || 3600; // 1 hour default
    const operation = options.operation || 'getObject';

    try {
      let command;
      
      if (operation === 'putObject') {
        command = new PutObjectCommand({
          Bucket: bucketName,
          Key: options.key,
        });
      } else {
        command = new GetObjectCommand({
          Bucket: bucketName,
          Key: options.key,
        });
      }

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL for ${bucketName}/${options.key}:`, error);
      throw new Error(`Signed URL generation failed: ${error.message}`);
    }
  }

  /**
   * List files in a bucket with optional prefix
   */
  async listFiles(bucket: StorageBucket, prefix?: string, maxKeys?: number): Promise<string[]> {
    const bucketName = this.bucketMapping[bucket];
    
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys || 1000,
      });

      const response = await this.s3Client.send(command);
      return response.Contents?.map(object => object.Key).filter(Boolean) || [];
    } catch (error) {
      this.logger.error(`Failed to list files in ${bucketName}:`, error);
      throw new Error(`List files failed: ${error.message}`);
    }
  }

  /**
   * Get the public URL for a file (CloudFront or S3)
   */
  getFileUrl(bucket: StorageBucket, key: string): string {
    const cloudFrontDomain = this.configService.awsCloudFrontDomain;
    
    if (cloudFrontDomain) {
      // Use CloudFront URL if available
      const bucketPath = this.getBucketPath(bucket);
      return `https://${cloudFrontDomain}/${bucketPath}/${key}`;
    } else {
      // Fallback to S3 direct URL
      const bucketName = this.bucketMapping[bucket];
      return `https://${bucketName}.s3.${this.configService.awsRegion}.amazonaws.com/${key}`;
    }
  }

  /**
   * Create bucket if it doesn't exist
   */
  async ensureBucketExists(bucket: StorageBucket): Promise<void> {
    const bucketName = this.bucketMapping[bucket];
    
    try {
      // Check if bucket exists
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      this.logger.log(`Bucket ${bucketName} already exists`);
    } catch (error) {
      if (error.name === 'NotFound') {
        // Create bucket
        await this.createBucket(bucket);
      } else {
        this.logger.error(`Failed to check bucket ${bucketName}:`, error);
        throw error;
      }
    }
  }

  /**
   * Create a new S3 bucket with CORS configuration
   */
  private async createBucket(bucket: StorageBucket): Promise<void> {
    const bucketName = this.bucketMapping[bucket];
    
    try {
      // Create bucket
      await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      
      // Configure CORS
      await this.configureBucketCors(bucket);
      
      this.logger.log(`Bucket ${bucketName} created successfully`);
    } catch (error) {
      this.logger.error(`Failed to create bucket ${bucketName}:`, error);
      throw new Error(`Bucket creation failed: ${error.message}`);
    }
  }

  /**
   * Configure CORS for a bucket
   */
  private async configureBucketCors(bucket: StorageBucket): Promise<void> {
    const bucketName = this.bucketMapping[bucket];
    
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'], // In production, restrict this to your domain
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000,
        },
      ],
    };

    try {
      await this.s3Client.send(new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: corsConfiguration,
      }));
      
      this.logger.log(`CORS configured for bucket ${bucketName}`);
    } catch (error) {
      this.logger.error(`Failed to configure CORS for bucket ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Get bucket path for CloudFront
   */
  private getBucketPath(bucket: StorageBucket): string {
    // This maps bucket types to paths in CloudFront
    const pathMapping = {
      [StorageBucket.SKETCHES]: 'sketches',
      [StorageBucket.PRODUCTS]: 'products',
      [StorageBucket.USER_UPLOADS]: 'uploads',
      [StorageBucket.GIFTS]: 'gifts',
    };
    
    return pathMapping[bucket];
  }
} 