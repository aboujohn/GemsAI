import { NotFoundException } from '@nestjs/common';
import { PaginationRequestDto, PaginationResponseDto } from '../dto/pagination.dto';
import { BaseEntity } from './base-entity.interface';

/**
 * Base service abstract class that all domain services should extend
 * Provides common CRUD operations
 */
export abstract class BaseService<T extends BaseEntity, CreateDto, UpdateDto> {
  /**
   * Repository field that must be implemented by child classes
   * This is a placeholder that will be replaced by actual database repositories
   */
  protected abstract readonly entities: T[];
  
  /**
   * Entity name for error messages
   */
  protected abstract readonly entityName: string;

  /**
   * Find all entities with pagination
   */
  async findAll(paginationDto?: PaginationRequestDto): Promise<PaginationResponseDto<T>> {
    const { page = 1, limit = 10 } = paginationDto || {};
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const items = this.entities.slice(startIndex, endIndex);

    return {
      items,
      total: this.entities.length,
      page,
      limit,
      pages: Math.ceil(this.entities.length / limit),
      hasNext: endIndex < this.entities.length,
      hasPrevious: page > 1,
    };
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T> {
    const entity = this.entities.find(e => e.id === id);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }
    return entity;
  }

  /**
   * Create a new entity
   */
  async create(createDto: CreateDto): Promise<T> {
    const newEntity = this.mapToEntity(createDto);
    this.entities.push(newEntity);
    return newEntity;
  }

  /**
   * Update an existing entity
   */
  async update(id: string, updateDto: UpdateDto): Promise<T> {
    const index = this.entities.findIndex(e => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }

    const updatedEntity = {
      ...this.entities[index],
      ...updateDto,
      updatedAt: new Date(),
    } as T;

    this.entities[index] = updatedEntity;
    return updatedEntity;
  }

  /**
   * Delete an entity
   */
  async remove(id: string): Promise<boolean> {
    const initialLength = this.entities.length;
    const filteredEntities = this.entities.filter(e => e.id !== id);
    
    if (initialLength === filteredEntities.length) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }
    
    this.entities.length = 0;
    this.entities.push(...filteredEntities);
    
    return true;
  }

  /**
   * Map a DTO to an entity
   * This method must be implemented by child classes
   */
  protected abstract mapToEntity(dto: CreateDto): T;
} 