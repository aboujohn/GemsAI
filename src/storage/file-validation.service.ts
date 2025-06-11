import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  mimeType?: string;
  size?: number;
}

export interface ValidationOptions {
  maxFileSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

@Injectable()
export class FileValidationService {
  private readonly defaultMaxFileSize = 50 * 1024 * 1024; // 50MB
  
  // Predefined validation rules for different file types
  private readonly validationRules = {
    image: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/bmp',
        'image/tiff',
      ],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'],
    },
    sketch: {
      maxFileSize: 25 * 1024 * 1024, // 25MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
      ],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf'],
    },
    document: {
      maxFileSize: 20 * 1024 * 1024, // 20MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
    },
    video: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedMimeTypes: [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/webm',
      ],
      allowedExtensions: ['.mp4', '.mpeg', '.mov', '.webm'],
    },
  };

  constructor(private readonly configService: ConfigService) {}

  /**
   * Validate a file based on predefined rules
   */
  validateFile(
    file: Express.Multer.File,
    fileType: keyof typeof this.validationRules,
    customOptions?: ValidationOptions
  ): ValidationResult {
    const rules = this.validationRules[fileType];
    const options = {
      ...rules,
      ...customOptions,
    };

    return this.validateFileWithOptions(file, options);
  }

  /**
   * Validate a file with custom options
   */
  validateFileWithOptions(
    file: Express.Multer.File,
    options: ValidationOptions
  ): ValidationResult {
    const {
      maxFileSize = this.defaultMaxFileSize,
      allowedMimeTypes = [],
      allowedExtensions = [],
    } = options;

    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size of ${this.formatFileSize(maxFileSize)}`,
      };
    }

    // Check MIME type
    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `File type '${file.mimetype}' is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      };
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const fileExtension = this.getFileExtension(file.originalname);
      if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
        return {
          isValid: false,
          error: `File extension '${fileExtension}' is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
        };
      }
    }

    // Additional security checks
    const securityCheck = this.performSecurityCheck(file);
    if (!securityCheck.isValid) {
      return securityCheck;
    }

    return {
      isValid: true,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  /**
   * Validate multiple files
   */
  validateFiles(
    files: Express.Multer.File[],
    fileType: keyof typeof this.validationRules,
    customOptions?: ValidationOptions
  ): ValidationResult[] {
    return files.map(file => this.validateFile(file, fileType, customOptions));
  }

  /**
   * Check if all validation results are valid
   */
  areAllFilesValid(results: ValidationResult[]): boolean {
    return results.every(result => result.isValid);
  }

  /**
   * Get validation errors from results
   */
  getValidationErrors(results: ValidationResult[]): string[] {
    return results
      .filter(result => !result.isValid)
      .map(result => result.error)
      .filter(Boolean);
  }

  /**
   * Throw BadRequestException if validation fails
   */
  throwIfInvalid(result: ValidationResult): void {
    if (!result.isValid) {
      throw new BadRequestException(result.error);
    }
  }

  /**
   * Throw BadRequestException if any file validation fails
   */
  throwIfAnyInvalid(results: ValidationResult[]): void {
    const errors = this.getValidationErrors(results);
    if (errors.length > 0) {
      throw new BadRequestException(`File validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  }

  /**
   * Format file size for human readability
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Perform basic security checks on the file
   */
  private performSecurityCheck(file: Express.Multer.File): ValidationResult {
    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js)$/i,
      /\.(php|asp|aspx|jsp|pl|py|rb)$/i,
      /\.(sh|bash|csh|tcsh|ksh|zsh)$/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.originalname)) {
        return {
          isValid: false,
          error: 'File type not allowed for security reasons',
        };
      }
    }

    // Check file content vs. extension mismatch (basic check)
    const expectedMimeTypes = this.getMimeTypesForExtension(this.getFileExtension(file.originalname));
    if (expectedMimeTypes.length > 0 && !expectedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: 'File content does not match file extension',
      };
    }

    return { isValid: true };
  }

  /**
   * Get expected MIME types for a file extension
   */
  private getMimeTypesForExtension(extension: string): string[] {
    const mimeTypeMap: Record<string, string[]> = {
      '.jpg': ['image/jpeg'],
      '.jpeg': ['image/jpeg'],
      '.png': ['image/png'],
      '.gif': ['image/gif'],
      '.webp': ['image/webp'],
      '.pdf': ['application/pdf'],
      '.mp4': ['video/mp4'],
      '.mov': ['video/quicktime'],
      '.txt': ['text/plain'],
      '.doc': ['application/msword'],
      '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    };

    return mimeTypeMap[extension.toLowerCase()] || [];
  }

  /**
   * Generate a safe filename
   */
  generateSafeFilename(originalName: string, prefix?: string): string {
    // Remove unsafe characters and normalize
    const extension = this.getFileExtension(originalName);
    const baseName = originalName
      .replace(extension, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');

    // Add timestamp and random string to ensure uniqueness
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    
    const finalBaseName = prefix ? `${prefix}_${baseName}` : baseName;
    
    return `${finalBaseName}_${timestamp}_${randomString}${extension}`.toLowerCase();
  }

  /**
   * Get validation rules for a specific file type
   */
  getValidationRules(fileType: keyof typeof this.validationRules): ValidationOptions {
    return { ...this.validationRules[fileType] };
  }
} 