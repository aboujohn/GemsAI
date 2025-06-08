import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/interfaces/base-service.abstract';
import { EventService } from '../common/events/event.service';
import { EventTypes } from '../common/events/event.types';
import { PaginationRequestDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { CreateSketchDto } from './dto/create-sketch.dto';
import { UpdateSketchDto } from './dto/update-sketch.dto';
import { SketchResponseDto } from './dto/sketch-response.dto';
import { v4 as uuidv4 } from 'uuid';

// This is a placeholder interface that represents our domain entity
interface SketchEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Owner of the sketch
  storyId: string;
  imageUrl: string;
  description: string;
  notes?: string;
}

@Injectable()
export class SketchService extends BaseService<SketchEntity, CreateSketchDto, UpdateSketchDto> {
  // In-memory storage until we implement database repositories
  protected readonly entities: SketchEntity[] = [];
  protected readonly entityName = 'Sketch';

  constructor(private readonly eventService: EventService) {
    super();
  }

  /**
   * Find all sketches with pagination and optional filtering by storyId
   */
  async findAll(
    paginationDto?: PaginationRequestDto,
    storyId?: string
  ): Promise<PaginationResponseDto<SketchEntity>> {
    const { page = 1, limit = 10 } = paginationDto || {};

    // Filter by storyId if provided
    const filteredSketches = storyId
      ? this.entities.filter(s => s.storyId === storyId)
      : this.entities;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const items = filteredSketches.slice(startIndex, endIndex);

    return {
      items,
      total: filteredSketches.length,
      page,
      limit,
      pages: Math.ceil(filteredSketches.length / limit),
      hasNext: endIndex < filteredSketches.length,
      hasPrevious: page > 1,
    };
  }

  /**
   * Create a new sketch
   * Override to add custom business logic
   */
  async create(createDto: CreateSketchDto): Promise<SketchEntity> {
    // Simulating a user ID for now - would come from auth context in real app
    const userId = 'mock-user-id';

    const sketch = await super.create({
      ...createDto,
      userId,
    } as CreateSketchDto);

    // Emit event after successful creation
    this.eventService.emitSketchCreated(sketch.id, sketch.storyId, sketch.imageUrl, userId);

    return sketch;
  }

  /**
   * Update a sketch
   * Override to add custom business logic
   */
  async update(id: string, updateDto: UpdateSketchDto): Promise<SketchEntity> {
    // Track which fields are updated for the event
    const updatedFields = Object.keys(updateDto);

    const sketch = await super.update(id, updateDto);

    // Emit event after successful update
    if (updatedFields.length > 0) {
      this.eventService.emitEvent(EventTypes.SKETCH_UPDATED, {
        sketchId: id,
        storyId: sketch.storyId,
        updatedFields,
      });
    }

    return sketch;
  }

  /**
   * Delete a sketch
   * Override to add custom business logic
   */
  async remove(id: string): Promise<boolean> {
    // Find the sketch first to make sure it exists
    const sketch = await this.findById(id);

    const result = await super.remove(id);

    // Emit event after successful deletion
    this.eventService.emitEvent(EventTypes.SKETCH_DELETED, {
      sketchId: id,
      storyId: sketch.storyId,
    });

    return result;
  }

  /**
   * Map SketchEntity to SketchResponseDto
   */
  mapToResponseDto(entity: SketchEntity): SketchResponseDto {
    return {
      id: entity.id,
      storyId: entity.storyId,
      imageUrl: entity.imageUrl,
      description: entity.description,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  /**
   * Convert DTO to entity
   */
  protected mapToEntity(dto: CreateSketchDto): SketchEntity {
    const now = new Date();
    return {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      userId: 'mock-user-id', // This would come from auth context in a real app
      storyId: dto.storyId,
      imageUrl: dto.imageUrl,
      description: dto.description,
      notes: dto.notes,
    };
  }
}
