import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import OpenAI from 'openai';
import { ConstructedPrompt } from './prompt-construction.service';

export interface ImageGenerationRequest {
  prompt: ConstructedPrompt;
  variants?: number; // Number of image variants to generate (1-5)
  userId: string;
  storyId: string;
}

export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
  provider: 'dalle' | 'sdxl';
  model: string;
  quality: string;
  size: string;
  generatedAt: Date;
}

export interface ImageGenerationResult {
  success: boolean;
  images: GeneratedImage[];
  error?: string;
  metadata: {
    provider: 'dalle' | 'sdxl';
    promptUsed: string;
    processingTimeMs: number;
    cost?: number;
  };
}

@Injectable()
export class ImageGenerationService {
  private readonly logger = new Logger(ImageGenerationService.name);
  private readonly openaiClient: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.openAiApiKey;
    if (!apiKey) {
      this.logger.warn('OpenAI API key not found. DALL-E generation will be disabled.');
    }
    
    this.openaiClient = new OpenAI({
      apiKey: apiKey || 'dummy-key',
    });
  }

  /**
   * Generate images using AI models with fallback capability
   */
  async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    this.logger.log(`Starting image generation for story ${request.storyId} with ${request.variants || 1} variants`);

    try {
      // Try DALL-E first
      const dalleResult = await this.generateWithDALLE(request);
      if (dalleResult.success) {
        const processingTime = Date.now() - startTime;
        this.logger.log(`DALL-E generation completed in ${processingTime}ms`);
        return {
          ...dalleResult,
          metadata: {
            ...dalleResult.metadata,
            processingTimeMs: processingTime,
          },
        };
      }

      // Fallback to SDXL if DALL-E fails
      this.logger.warn('DALL-E generation failed, falling back to SDXL');
      const sdxlResult = await this.generateWithSDXL(request);
      
      const processingTime = Date.now() - startTime;
      this.logger.log(`SDXL fallback completed in ${processingTime}ms`);
      
      return {
        ...sdxlResult,
        metadata: {
          ...sdxlResult.metadata,
          processingTimeMs: processingTime,
        },
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error('All image generation methods failed:', error);
      
      return {
        success: false,
        images: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          provider: 'dalle',
          promptUsed: request.prompt.fullPrompt,
          processingTimeMs: processingTime,
        },
      };
    }
  }

  /**
   * Generate images using OpenAI DALL-E
   */
  private async generateWithDALLE(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      const apiKey = this.configService.openAiApiKey;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const { prompt } = request;
      const variants = Math.min(request.variants || 1, 4); // DALL-E max is 4 for DALL-E 2, 1 for DALL-E 3

      this.logger.log(`Generating ${variants} image(s) with DALL-E`);

      // Use DALL-E 3 for high quality, DALL-E 2 for multiple variants
      const model = variants > 1 ? 'dall-e-2' : 'dall-e-3';
      const size = model === 'dall-e-3' ? '1024x1024' : '512x512';

      const response = await this.openaiClient.images.generate({
        model,
        prompt: prompt.fullPrompt,
        n: variants,
        size: size as any,
        quality: model === 'dall-e-3' ? (prompt.qualitySettings.quality === 'high' ? 'hd' : 'standard') : undefined,
        response_format: 'url',
      });

      const images: GeneratedImage[] = response.data.map((img, index) => ({
        url: img.url!,
        revisedPrompt: img.revised_prompt,
        provider: 'dalle' as const,
        model,
        quality: prompt.qualitySettings.quality,
        size,
        generatedAt: new Date(),
      }));

      return {
        success: true,
        images,
        metadata: {
          provider: 'dalle',
          promptUsed: prompt.fullPrompt,
          processingTimeMs: 0, // Will be filled by caller
          cost: this.calculateDALLECost(model, variants),
        },
      };

    } catch (error) {
      this.logger.error('DALL-E generation failed:', error);
      return {
        success: false,
        images: [],
        error: error instanceof Error ? error.message : 'DALL-E generation failed',
        metadata: {
          provider: 'dalle',
          promptUsed: request.prompt.fullPrompt,
          processingTimeMs: 0,
        },
      };
    }
  }

  /**
   * Generate images using SDXL (placeholder implementation)
   * TODO: Implement actual SDXL integration
   */
  private async generateWithSDXL(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      this.logger.log('Generating images with SDXL (placeholder implementation)');
      
      // This is a placeholder - in production, you would integrate with:
      // - Stability AI API for SDXL
      // - Replicate API
      // - Local SDXL deployment
      // - Other SDXL providers

      const { prompt } = request;
      const variants = request.variants || 1;

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate mock URLs for now
      const images: GeneratedImage[] = Array.from({ length: variants }, (_, index) => ({
        url: `https://placeholder.example.com/sdxl-generated-${Date.now()}-${index}.png`,
        provider: 'sdxl' as const,
        model: 'sdxl-turbo',
        quality: prompt.qualitySettings.quality,
        size: '1024x1024',
        generatedAt: new Date(),
      }));

      this.logger.warn('SDXL integration not implemented - returning placeholder URLs');

      return {
        success: true,
        images,
        metadata: {
          provider: 'sdxl',
          promptUsed: prompt.fullPrompt,
          processingTimeMs: 0, // Will be filled by caller
          cost: this.calculateSDXLCost(variants),
        },
      };

    } catch (error) {
      this.logger.error('SDXL generation failed:', error);
      return {
        success: false,
        images: [],
        error: error instanceof Error ? error.message : 'SDXL generation failed',
        metadata: {
          provider: 'sdxl',
          promptUsed: request.prompt.fullPrompt,
          processingTimeMs: 0,
        },
      };
    }
  }

  /**
   * Check if DALL-E is available
   */
  async isDalleAvailable(): Promise<boolean> {
    const apiKey = this.configService.openAiApiKey;
    if (!apiKey) {
      return false;
    }

    try {
      // Make a simple API call to check availability
      await this.openaiClient.models.list();
      return true;
    } catch (error) {
      this.logger.warn('DALL-E availability check failed:', error);
      return false;
    }
  }

  /**
   * Check if SDXL is available
   */
  async isSDXLAvailable(): Promise<boolean> {
    // TODO: Implement actual SDXL availability check
    // For now, return true as a placeholder
    return true;
  }

  /**
   * Get estimated cost for image generation
   */
  async getEstimatedCost(prompt: ConstructedPrompt, variants: number = 1): Promise<number> {
    const isDalleAvailable = await this.isDalleAvailable();
    
    if (isDalleAvailable) {
      const model = variants > 1 ? 'dall-e-2' : 'dall-e-3';
      return this.calculateDALLECost(model, variants);
    } else {
      return this.calculateSDXLCost(variants);
    }
  }

  /**
   * Calculate DALL-E generation cost
   */
  private calculateDALLECost(model: string, variants: number): number {
    // DALL-E 3: $0.04 per image (1024×1024), $0.08 per image (1024×1792 or 1792×1024)
    // DALL-E 2: $0.02 per image (1024×1024), $0.018 per image (512×512), $0.016 per image (256×256)
    
    const costPerImage = model === 'dall-e-3' ? 0.04 : 0.018; // Using 512x512 for DALL-E 2
    return costPerImage * variants;
  }

  /**
   * Calculate SDXL generation cost (placeholder)
   */
  private calculateSDXLCost(variants: number): number {
    // Placeholder cost calculation - adjust based on actual SDXL provider pricing
    const costPerImage = 0.01; // Estimated cost per image
    return costPerImage * variants;
  }
} 