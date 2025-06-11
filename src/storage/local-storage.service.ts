import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigService } from '../config/config.service';

export enum LocalStorageCategory {
  SKETCHES = 'sketches',
  PRODUCTS = 'products',
  USER_UPLOADS = 'user-uploads',
  GIFTS = 'gifts',
}

export interface LocalUploadOptions {
  category: LocalStorageCategory;
  key: string;
  buffer: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface LocalFileInfo {
  path: string;
  size: number;
  contentType?: string;
  lastModified: Date;
  metadata?: Record<string, string>;
}

@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly baseUploadDir = './uploads';
  private readonly metadataDir = './uploads/.metadata';

  constructor(private readonly configService: ConfigService) {
    this.initializeDirectories();
  }

  /**
   * Initialize local storage directories
   */
  private async initializeDirectories(): Promise<void> {
    try {
      // Create base upload directory
      await fs.mkdir(this.baseUploadDir, { recursive: true });
      await fs.mkdir(this.metadataDir, { recursive: true });

      // Create category directories
      for (const category of Object.values(LocalStorageCategory)) {
        await fs.mkdir(this.getCategoryPath(category), { recursive: true });
      }

      // Create optimized image directories
      const optimizedDir = path.join(this.baseUploadDir, 'optimized');
      await fs.mkdir(optimizedDir, { recursive: true });
      
      const sizes = ['thumbnails', 'small', 'medium', 'large'];
      for (const size of sizes) {
        await fs.mkdir(path.join(optimizedDir, size), { recursive: true });
      }

      this.logger.log('Local storage directories initialized');
    } catch (error) {
      this.logger.error('Failed to initialize local storage directories:', error);
      throw error;
    }
  }

  /**
   * Upload a file to local storage
   */
  async uploadFile(options: LocalUploadOptions): Promise<string> {
    try {
      const filePath = this.getFilePath(options.category, options.key);
      const fileDir = path.dirname(filePath);

      // Ensure directory exists
      await fs.mkdir(fileDir, { recursive: true });

      // Write file
      await fs.writeFile(filePath, options.buffer);

      // Save metadata if provided
      if (options.metadata || options.contentType) {
        await this.saveMetadata(options.category, options.key, {
          contentType: options.contentType,
          metadata: options.metadata,
          uploadedAt: new Date().toISOString(),
        });
      }

      const publicUrl = this.getPublicUrl(options.category, options.key);
      this.logger.log(`File uploaded locally: ${options.key} to ${options.category}`);
      
      return publicUrl;
    } catch (error) {
      this.logger.error(`Failed to upload file locally: ${options.key}`, error);
      throw new Error(`Local upload failed: ${error.message}`);
    }
  }

  /**
   * Download a file from local storage
   */
  async downloadFile(category: LocalStorageCategory, key: string): Promise<Buffer> {
    try {
      const filePath = this.getFilePath(category, key);
      const buffer = await fs.readFile(filePath);
      return buffer;
    } catch (error) {
      this.logger.error(`Failed to download file locally: ${key}`, error);
      throw new Error(`Local download failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from local storage
   */
  async deleteFile(category: LocalStorageCategory, key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(category, key);
      await fs.unlink(filePath);

      // Delete metadata
      await this.deleteMetadata(category, key);

      this.logger.log(`File deleted locally: ${key} from ${category}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`File not found for deletion: ${key}`);
        return; // File doesn't exist, consider it deleted
      }
      this.logger.error(`Failed to delete file locally: ${key}`, error);
      throw new Error(`Local delete failed: ${error.message}`);
    }
  }

  /**
   * Check if a file exists in local storage
   */
  async fileExists(category: LocalStorageCategory, key: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(category, key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List files in a category
   */
  async listFiles(category: LocalStorageCategory, prefix?: string): Promise<string[]> {
    try {
      const categoryPath = this.getCategoryPath(category);
      const files = await this.getAllFilesRecursive(categoryPath);
      
      const relativePaths = files.map(file => 
        path.relative(categoryPath, file).replace(/\\/g, '/')
      );

      if (prefix) {
        return relativePaths.filter(file => file.startsWith(prefix));
      }

      return relativePaths;
    } catch (error) {
      this.logger.error(`Failed to list files locally in ${category}:`, error);
      throw new Error(`Local list failed: ${error.message}`);
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(category: LocalStorageCategory, key: string): Promise<LocalFileInfo> {
    try {
      const filePath = this.getFilePath(category, key);
      const stats = await fs.stat(filePath);
      const metadata = await this.getMetadata(category, key);

      return {
        path: filePath,
        size: stats.size,
        contentType: metadata?.contentType,
        lastModified: stats.mtime,
        metadata: metadata?.metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to get file info locally: ${key}`, error);
      throw new Error(`Get file info failed: ${error.message}`);
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(category: LocalStorageCategory, key: string): string {
    const baseUrl = this.configService.isDevelopment 
      ? `http://localhost:${this.configService.port}`
      : 'http://localhost:3001'; // fallback
    
    return `${baseUrl}/storage/file/${category}/${key}`;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<Record<LocalStorageCategory, { fileCount: number; totalSize: number; files: string[] }>> {
    const stats = {} as Record<LocalStorageCategory, { fileCount: number; totalSize: number; files: string[] }>;

    for (const category of Object.values(LocalStorageCategory)) {
      try {
        const files = await this.listFiles(category);
        let totalSize = 0;

        for (const file of files.slice(0, 100)) { // Limit to avoid performance issues
          try {
            const info = await this.getFileInfo(category, file);
            totalSize += info.size;
          } catch {
            // Skip files that can't be accessed
          }
        }

        stats[category] = {
          fileCount: files.length,
          totalSize,
          files: files.slice(0, 10), // Return first 10 for preview
        };
      } catch (error) {
        this.logger.error(`Failed to get stats for category ${category}:`, error);
        stats[category] = { fileCount: 0, totalSize: 0, files: [] };
      }
    }

    return stats;
  }

  /**
   * Clean up old files (optional maintenance)
   */
  async cleanupOldFiles(olderThanDays: number = 30): Promise<number> {
    let deletedCount = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    for (const category of Object.values(LocalStorageCategory)) {
      try {
        const files = await this.listFiles(category);
        
        for (const file of files) {
          try {
            const info = await this.getFileInfo(category, file);
            if (info.lastModified < cutoffDate) {
              await this.deleteFile(category, file);
              deletedCount++;
            }
          } catch {
            // Skip files that can't be processed
          }
        }
      } catch (error) {
        this.logger.error(`Failed to cleanup category ${category}:`, error);
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} old files`);
    return deletedCount;
  }

  /**
   * Get the file path for a category and key
   */
  private getFilePath(category: LocalStorageCategory, key: string): string {
    return path.join(this.getCategoryPath(category), key);
  }

  /**
   * Get the directory path for a category
   */
  private getCategoryPath(category: LocalStorageCategory): string {
    return path.join(this.baseUploadDir, category);
  }

  /**
   * Get all files recursively from a directory
   */
  private async getAllFilesRecursive(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getAllFilesRecursive(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  /**
   * Save file metadata
   */
  private async saveMetadata(category: LocalStorageCategory, key: string, metadata: any): Promise<void> {
    try {
      const metadataFile = this.getMetadataPath(category, key);
      const metadataDir = path.dirname(metadataFile);
      
      await fs.mkdir(metadataDir, { recursive: true });
      await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));
    } catch (error) {
      this.logger.warn(`Failed to save metadata for ${key}:`, error);
    }
  }

  /**
   * Get file metadata
   */
  private async getMetadata(category: LocalStorageCategory, key: string): Promise<any> {
    try {
      const metadataFile = this.getMetadataPath(category, key);
      const content = await fs.readFile(metadataFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Delete file metadata
   */
  private async deleteMetadata(category: LocalStorageCategory, key: string): Promise<void> {
    try {
      const metadataFile = this.getMetadataPath(category, key);
      await fs.unlink(metadataFile);
    } catch {
      // Metadata file doesn't exist, which is fine
    }
  }

  /**
   * Get metadata file path
   */
  private getMetadataPath(category: LocalStorageCategory, key: string): string {
    const metadataKey = `${category}_${key.replace(/[/\\]/g, '_')}.json`;
    return path.join(this.metadataDir, metadataKey);
  }
} 