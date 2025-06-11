import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

export interface OptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: { r: number; g: number; b: number; alpha?: number };
  progressive?: boolean;
  removeMetadata?: boolean;
}

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  isAnimated?: boolean;
}

export interface OptimizationResult {
  buffer: Buffer;
  info: ImageInfo;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

@Injectable()
export class ImageOptimizationService {
  private readonly logger = new Logger(ImageOptimizationService.name);

  // Predefined optimization presets
  private readonly presets = {
    thumbnail: {
      width: 150,
      height: 150,
      quality: 80,
      format: 'webp' as const,
      fit: 'cover' as const,
      removeMetadata: true,
    },
    small: {
      width: 400,
      height: 400,
      quality: 85,
      format: 'webp' as const,
      fit: 'inside' as const,
      removeMetadata: true,
    },
    medium: {
      width: 800,
      height: 800,
      quality: 90,
      format: 'webp' as const,
      fit: 'inside' as const,
      removeMetadata: true,
    },
    large: {
      width: 1200,
      height: 1200,
      quality: 90,
      format: 'webp' as const,
      fit: 'inside' as const,
      removeMetadata: true,
    },
    original: {
      quality: 95,
      format: 'jpeg' as const,
      removeMetadata: false,
    },
  };

  /**
   * Optimize an image with custom options
   */
  async optimizeImage(
    inputBuffer: Buffer,
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    try {
      const originalSize = inputBuffer.length;
      const inputInfo = await this.getImageInfo(inputBuffer);

      let sharpInstance = sharp(inputBuffer);

      // Apply transformations
      if (options.width || options.height) {
        sharpInstance = sharpInstance.resize({
          width: options.width,
          height: options.height,
          fit: options.fit || 'inside',
          background: options.background || { r: 255, g: 255, b: 255, alpha: 1 },
          withoutEnlargement: true,
        });
      }

      // Set output format and quality
      const format = options.format || 'webp';
      const quality = options.quality || 90;

      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({
            quality,
            progressive: options.progressive !== false,
            mozjpeg: true,
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({
            quality,
            progressive: options.progressive !== false,
            compressionLevel: 9,
          });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({
            quality,
            effort: 6,
          });
          break;
      }

      // Remove metadata if requested
      if (options.removeMetadata) {
        sharpInstance = sharpInstance.withMetadata();
      }

      // Process the image
      const optimizedBuffer = await sharpInstance.toBuffer();
      const optimizedSize = optimizedBuffer.length;
      const outputInfo = await this.getImageInfo(optimizedBuffer);

      const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

      this.logger.log(
        `Image optimized: ${originalSize} bytes → ${optimizedSize} bytes (${compressionRatio.toFixed(1)}% reduction)`
      );

      return {
        buffer: optimizedBuffer,
        info: outputInfo,
        originalSize,
        optimizedSize,
        compressionRatio,
      };
    } catch (error) {
      this.logger.error('Image optimization failed:', error);
      throw new Error(`Image optimization failed: ${error.message}`);
    }
  }

  /**
   * Optimize image using a preset
   */
  async optimizeWithPreset(
    inputBuffer: Buffer,
    preset: keyof typeof this.presets,
    additionalOptions: Partial<OptimizationOptions> = {}
  ): Promise<OptimizationResult> {
    const presetOptions = this.presets[preset];
    const mergedOptions = { ...presetOptions, ...additionalOptions };
    return this.optimizeImage(inputBuffer, mergedOptions);
  }

  /**
   * Generate multiple sizes of an image
   */
  async generateImageSizes(
    inputBuffer: Buffer,
    sizes: Array<keyof typeof this.presets | OptimizationOptions> = ['thumbnail', 'small', 'medium', 'large']
  ): Promise<Record<string, OptimizationResult>> {
    const results: Record<string, OptimizationResult> = {};

    for (const size of sizes) {
      try {
        if (typeof size === 'string' && size in this.presets) {
          results[size] = await this.optimizeWithPreset(inputBuffer, size);
        } else if (typeof size === 'object') {
          const sizeKey = `custom_${size.width || 'auto'}x${size.height || 'auto'}`;
          results[sizeKey] = await this.optimizeImage(inputBuffer, size);
        }
      } catch (error) {
        this.logger.error(`Failed to generate size ${JSON.stringify(size)}:`, error);
      }
    }

    return results;
  }

  /**
   * Get image information
   */
  async getImageInfo(buffer: Buffer): Promise<ImageInfo> {
    try {
      const metadata = await sharp(buffer).metadata();
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
        hasAlpha: metadata.hasAlpha || false,
        isAnimated: metadata.pages ? metadata.pages > 1 : false,
      };
    } catch (error) {
      this.logger.error('Failed to get image info:', error);
      throw new Error(`Failed to get image info: ${error.message}`);
    }
  }

  /**
   * Check if a buffer contains a valid image
   */
  async isValidImage(buffer: Buffer): Promise<boolean> {
    try {
      await sharp(buffer).metadata();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Convert image to specific format
   */
  async convertFormat(
    inputBuffer: Buffer,
    targetFormat: 'jpeg' | 'png' | 'webp',
    quality: number = 90
  ): Promise<Buffer> {
    try {
      let sharpInstance = sharp(inputBuffer);

      switch (targetFormat) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
      }

      return await sharpInstance.toBuffer();
    } catch (error) {
      this.logger.error(`Format conversion to ${targetFormat} failed:`, error);
      throw new Error(`Format conversion failed: ${error.message}`);
    }
  }

  /**
   * Apply watermark to image
   */
  async applyWatermark(
    imageBuffer: Buffer,
    watermarkBuffer: Buffer,
    options: {
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
      opacity?: number;
      scale?: number;
    } = {}
  ): Promise<Buffer> {
    try {
      const { position = 'bottom-right', opacity = 0.5, scale = 0.2 } = options;
      
      const image = sharp(imageBuffer);
      const imageMetadata = await image.metadata();
      
      // Resize watermark based on scale
      const watermarkWidth = Math.round((imageMetadata.width || 0) * scale);
      const resizedWatermark = await sharp(watermarkBuffer)
        .resize({ width: watermarkWidth })
        .png()
        .toBuffer();

      const watermarkMetadata = await sharp(resizedWatermark).metadata();

      // Calculate position
      let left = 0;
      let top = 0;

      switch (position) {
        case 'top-left':
          left = 10;
          top = 10;
          break;
        case 'top-right':
          left = (imageMetadata.width || 0) - (watermarkMetadata.width || 0) - 10;
          top = 10;
          break;
        case 'bottom-left':
          left = 10;
          top = (imageMetadata.height || 0) - (watermarkMetadata.height || 0) - 10;
          break;
        case 'bottom-right':
          left = (imageMetadata.width || 0) - (watermarkMetadata.width || 0) - 10;
          top = (imageMetadata.height || 0) - (watermarkMetadata.height || 0) - 10;
          break;
        case 'center':
          left = Math.round(((imageMetadata.width || 0) - (watermarkMetadata.width || 0)) / 2);
          top = Math.round(((imageMetadata.height || 0) - (watermarkMetadata.height || 0)) / 2);
          break;
      }

      // Apply watermark with opacity
      const watermarkWithOpacity = await sharp(resizedWatermark)
        .composite([{
          input: Buffer.from([255, 255, 255, Math.round(255 * opacity)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in',
        }])
        .png()
        .toBuffer();

      return await image
        .composite([{ input: watermarkWithOpacity, left, top }])
        .toBuffer();
    } catch (error) {
      this.logger.error('Watermark application failed:', error);
      throw new Error(`Watermark application failed: ${error.message}`);
    }
  }

  /**
   * Create a blurred version of an image
   */
  async createBlurredVersion(buffer: Buffer, sigma: number = 10): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .blur(sigma)
        .toBuffer();
    } catch (error) {
      this.logger.error('Image blur failed:', error);
      throw new Error(`Image blur failed: ${error.message}`);
    }
  }

  /**
   * Extract dominant colors from an image
   */
  async extractDominantColors(buffer: Buffer, colorCount: number = 5): Promise<Array<{ r: number; g: number; b: number; count: number }>> {
    try {
      const { dominant } = await sharp(buffer)
        .resize(100, 100, { fit: 'cover' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      // This is a simplified implementation
      // For more advanced color extraction, consider using a library like node-vibrant
      return [dominant];
    } catch (error) {
      this.logger.error('Color extraction failed:', error);
      throw new Error(`Color extraction failed: ${error.message}`);
    }
  }

  /**
   * Get available optimization presets
   */
  getAvailablePresets(): Array<keyof typeof this.presets> {
    return Object.keys(this.presets) as Array<keyof typeof this.presets>;
  }

  /**
   * Get preset configuration
   */
  getPresetConfig(preset: keyof typeof this.presets): OptimizationOptions {
    return { ...this.presets[preset] };
  }
} 