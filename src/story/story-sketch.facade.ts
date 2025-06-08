import { Injectable } from '@nestjs/common';
import { StoryService } from './story.service';
import { SketchService } from '../sketch/sketch.service';
import { PaginationRequestDto } from '../common/dto/pagination.dto';
import { StoryResponseDto } from './dto/story-response.dto';
import { SketchResponseDto } from '../sketch/dto/sketch-response.dto';

/**
 * Facade service that handles operations requiring both Story and Sketch modules
 * This demonstrates cross-module communication without circular dependencies
 */
@Injectable()
export class StorySketchFacade {
  constructor(
    private readonly storyService: StoryService,
    private readonly sketchService: SketchService,
  ) {}

  /**
   * Get a story with all associated sketches
   * @param storyId The ID of the story to retrieve
   * @returns Story with its sketches
   */
  async getStoryWithSketches(storyId: string): Promise<{
    story: StoryResponseDto;
    sketches: SketchResponseDto[];
  }> {
    // Fetch story and sketches in parallel
    const [story, sketchResult] = await Promise.all([
      this.storyService.findById(storyId),
      this.sketchService.findAll({ page: 1, limit: 100 }, storyId),
    ]);

    // Transform entities to DTOs
    return {
      story: this.storyService.mapToResponseDto(story),
      sketches: sketchResult.items.map(sketch => this.sketchService.mapToResponseDto(sketch)),
    };
  }

  /**
   * Get dashboard data combining stories and sketches
   * This could be used for a user's dashboard showing their content
   */
  async getDashboardData(
    userId: string,
    paginationDto: PaginationRequestDto,
  ): Promise<{
    recentStories: StoryResponseDto[];
    recentSketches: SketchResponseDto[];
  }> {
    // In a real app, we would filter by userId
    // For now, we're just demonstrating the cross-module access
    const [storiesResult, sketchesResult] = await Promise.all([
      this.storyService.findAll(paginationDto),
      this.sketchService.findAll(paginationDto),
    ]);

    return {
      recentStories: storiesResult.items.map(story => this.storyService.mapToResponseDto(story)),
      recentSketches: sketchesResult.items.map(sketch => this.sketchService.mapToResponseDto(sketch)),
    };
  }
} 