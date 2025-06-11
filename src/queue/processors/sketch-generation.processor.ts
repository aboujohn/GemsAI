import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SketchGenerationJobData, JobResult } from '../interfaces/job.interface';
import { PromptConstructionService, EmotionTag, SketchStyle } from '../../sketch/services/prompt-construction.service';
import { ImageGenerationService, ImageGenerationRequest } from '../../sketch/services/image-generation.service';
import { LocalStorageService, LocalStorageCategory } from '../../storage/local-storage.service';
import { SketchStatusService, SketchGenerationStatus } from '../../sketch/services/sketch-status.service';

@Injectable()
export class SketchGenerationProcessor {
  private readonly logger = new Logger(SketchGenerationProcessor.name);

  constructor(
    private readonly promptService: PromptConstructionService,
    private readonly imageGenerationService: ImageGenerationService,
    private readonly storageService: LocalStorageService,
    private readonly statusService: SketchStatusService,
  ) {}

  async process(job: Job<SketchGenerationJobData>): Promise<JobResult> {
    const startTime = Date.now();
    this.logger.log(`Processing sketch generation job ${job.id} for story ${job.data.storyId}`);
    
    try {
      const jobData = job.data;
      
      // Handle both new and legacy job data formats
      if (jobData.storyText && jobData.emotionTags && jobData.style) {
        return await this.processNewFormat(job, startTime);
      } else if (jobData.prompt) {
        return await this.processLegacyFormat(job, startTime);
      } else {
        throw new Error('Invalid job data: missing required fields');
      }
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`Sketch generation job ${job.id} failed:`, error);
      
      // Update status to failed
      try {
        await this.statusService.updateJobStatus(
          job.id!.toString(), 
          SketchGenerationStatus.FAILED,
          {
            processingTimeMs: processingTime,
            attempts: job.attemptsMade,
          },
          error instanceof Error ? error.message : 'Unknown error'
        );
      } catch (statusError) {
        this.logger.error(`Failed to update job status for ${job.id}:`, statusError);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          jobId: job.id,
          attempts: job.attemptsMade,
          processingTimeMs: processingTime,
        },
      };
    }
  }

  /**
   * Process new format with story text and emotion tags
   */
  private async processNewFormat(job: Job<SketchGenerationJobData>, startTime: number): Promise<JobResult> {
    const { storyId, storyText, emotionTags, style, variants = 1, additionalContext, userId } = job.data;

    this.logger.log(`Processing new format job for story ${storyId} with style: ${style}`);

    try {
      // Create status tracking entry
      await this.statusService.createJob({
        id: job.id!.toString(),
        storyId,
        userId: userId || 'unknown',
        style,
        variants,
      });

      // Update status to processing
      await this.statusService.updateJobStatus(job.id!.toString(), SketchGenerationStatus.PROCESSING);

      // 1. Get the style configuration
      const sketchStyle = this.promptService.getStyle(style);
      if (!sketchStyle) {
        throw new Error(`Unknown sketch style: ${style}`);
      }

      // 2. Construct the prompt
      const constructedPrompt = await this.promptService.constructPrompt({
        storyText,
        emotionTags: emotionTags as EmotionTag[],
        style: sketchStyle,
        additionalContext,
      });

      // 3. Generate images
      const imageRequest: ImageGenerationRequest = {
        prompt: constructedPrompt,
        variants,
        userId: userId || 'unknown',
        storyId,
      };

      const generationResult = await this.imageGenerationService.generateImages(imageRequest);
      
      if (!generationResult.success) {
        throw new Error(`Image generation failed: ${generationResult.error}`);
      }

      // 4. Download and store images locally (for development)
      const storedImages = await this.storeImagesLocally(generationResult.images, storyId, job.id!.toString());

      const processingTime = Date.now() - startTime;
      this.logger.log(`Sketch generation job ${job.id} completed successfully in ${processingTime}ms`);

      // Update status to completed with metadata
      await this.statusService.updateJobStatus(
        job.id!.toString(), 
        SketchGenerationStatus.COMPLETED,
        {
          provider: generationResult.metadata.provider,
          cost: generationResult.metadata.cost,
          processingTimeMs: processingTime,
        }
      );

      return {
        success: true,
        data: {
          storyId,
          images: storedImages,
          prompt: constructedPrompt,
          generationMetadata: generationResult.metadata,
          generatedAt: new Date().toISOString(),
        },
        metadata: {
          processingTimeMs: processingTime,
          provider: generationResult.metadata.provider,
          cost: generationResult.metadata.cost,
          memoryUsage: process.memoryUsage(),
        },
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`New format job ${job.id} failed:`, error);
      
      // Update status to failed
      try {
        await this.statusService.updateJobStatus(
          job.id!.toString(), 
          SketchGenerationStatus.FAILED,
          {
            processingTimeMs: processingTime,
            attempts: job.attemptsMade,
          },
          error instanceof Error ? error.message : 'Unknown error'
        );
      } catch (statusError) {
        this.logger.error(`Failed to update job status for ${job.id}:`, statusError);
      }
      
      throw error; // Re-throw to be caught by main error handler
    }
  }

  /**
   * Process legacy format for backward compatibility
   */
  private async processLegacyFormat(job: Job<SketchGenerationJobData>, startTime: number): Promise<JobResult> {
    const { prompt, style, dimensions, quality } = job.data;
    
    this.logger.log(`Processing legacy format job ${job.id}`);
    
    // Simulate processing time based on quality
    const processingTime = this.getProcessingTime(quality || 'standard');
    await this.simulateProcessing(processingTime);
    
    const mockResult = {
      sketchUrl: `https://example.com/sketches/${job.id}.png`,
      prompt,
      style: style || 'default',
      dimensions: dimensions || { width: 512, height: 512 },
      quality: quality || 'standard',
      generatedAt: new Date().toISOString(),
    };

    const totalProcessingTime = Date.now() - startTime;
    this.logger.log(`Legacy sketch generation job ${job.id} completed successfully`);
    
    return {
      success: true,
      data: mockResult,
      metadata: {
        processingTimeMs: totalProcessingTime,
        memoryUsage: process.memoryUsage(),
        legacy: true,
      },
    };
  }

  /**
   * Store generated images locally for development
   */
  private async storeImagesLocally(images: any[], storyId: string, jobId: string): Promise<any[]> {
    const storedImages = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      try {
        // For development, we'll simulate storing the image
        // In production, this would download from the AI service URL and store locally
        const fileName = `${storyId}_${jobId}_${i + 1}.png`;
        const key = `${storyId}/${fileName}`;
        
        // TODO: Implement actual image download and storage
        // For now, we'll use the original URL
        const localUrl = await this.simulateImageStorage(image.url, key);
        
        storedImages.push({
          ...image,
          localUrl,
          fileName,
          storageKey: key,
        });
        
      } catch (error) {
        this.logger.error(`Failed to store image ${i + 1} for job ${jobId}:`, error);
        // Continue with other images even if one fails
        storedImages.push({
          ...image,
          error: 'Storage failed',
        });
      }
    }

    return storedImages;
  }

  /**
   * Simulate image storage for development
   * TODO: Replace with actual image download and storage
   */
  private async simulateImageStorage(imageUrl: string, key: string): Promise<string> {
    // Simulate storage delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a local URL format
    return `/uploads/sketches/${key}`;
  }

  private getProcessingTime(quality: string): number {
    switch (quality) {
      case 'draft':
        return 2000; // 2 seconds
      case 'standard':
        return 5000; // 5 seconds
      case 'high':
        return 10000; // 10 seconds
      default:
        return 5000;
    }
  }

  private async simulateProcessing(timeMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeMs));
  }
} 