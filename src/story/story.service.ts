import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../common/interfaces/base-service.abstract';
import { EventService } from '../common/events/event.service';
import { EventTypes } from '../common/events/event.types';
import { PaginationRequestDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryResponseDto } from './dto/story-response.dto';
import { v4 as uuidv4 } from 'uuid';

// This is a placeholder interface that represents our domain entity
// Would be replaced by an actual entity class in a real implementation
interface StoryEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Owner of the story
  title: string;
  content: string;
  tags: string[];
}

@Injectable()
export class StoryService extends BaseService<StoryEntity, CreateStoryDto, UpdateStoryDto> {
  // In-memory storage until we implement database repositories
  protected readonly entities: StoryEntity[] = [];
  protected readonly entityName = 'Story';

  constructor(private readonly eventService: EventService) {
    super();
  }

  /**
   * Find all stories with pagination
   * Override to add custom filtering if needed
   */
  async findAll(paginationDto?: PaginationRequestDto): Promise<PaginationResponseDto<StoryEntity>> {
    return super.findAll(paginationDto);
  }

  /**
   * Create a new story
   * Override to add custom business logic
   */
  async create(createDto: CreateStoryDto): Promise<StoryEntity> {
    // Simulating a user ID for now - would come from auth context in real app
    const userId = 'mock-user-id';

    const story = await super.create({
      ...createDto,
      userId,
    } as CreateStoryDto);

    // Emit event after successful creation
    this.eventService.emitStoryCreated(story.id, story.title, userId);

    return story;
  }

  /**
   * Update a story
   * Override to add custom business logic
   */
  async update(id: string, updateDto: UpdateStoryDto): Promise<StoryEntity> {
    // Track which fields are updated for the event
    const updatedFields = Object.keys(updateDto);

    const story = await super.update(id, updateDto);

    // Emit event after successful update
    if (updatedFields.length > 0) {
      this.eventService.emitStoryUpdated(id, updatedFields);
    }

    return story;
  }

  /**
   * Delete a story
   * Override to add custom business logic
   */
  async remove(id: string): Promise<boolean> {
    // Find the story first to make sure it exists
    const story = await this.findById(id);

    const result = await super.remove(id);

    // Emit event after successful deletion
    this.eventService.emitEvent(EventTypes.STORY_DELETED, {
      storyId: id,
    });

    return result;
  }

  /**
   * Map StoryEntity to StoryResponseDto
   * This method helps transform our internal entity into a public DTO
   */
  mapToResponseDto(entity: StoryEntity): StoryResponseDto {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      tags: entity.tags,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  /**
   * Convert DTO to entity
   */
  protected mapToEntity(dto: CreateStoryDto): StoryEntity {
    const now = new Date();
    return {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      userId: 'mock-user-id', // This would come from auth context in a real app
      title: dto.title,
      content: dto.content,
      tags: dto.tags || [],
    };
  }

  async findById(id: string): Promise<StoryResponseDto> {
    const story = this.entities.find(s => s.id === id);
    if (!story) {
      throw new NotFoundException(`Story with id ${id} not found`);
    }
    return {
      id: story.id,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      title: story.title,
      content: story.content,
      tags: story.tags,
    };
  }
}
