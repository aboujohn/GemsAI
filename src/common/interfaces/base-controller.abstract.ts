import { Body, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { BaseEntity } from './base-entity.interface';
import { BaseService } from './base-service.abstract';
import { PaginationRequestDto } from '../dto/pagination.dto';
import { BaseResponseDto } from '../dto/base-response.dto';

/**
 * Base controller abstract class that provides CRUD operations
 * All domain controllers should extend this class
 */
export abstract class BaseController<
  T extends BaseEntity,
  CreateDto,
  UpdateDto,
  ResponseDto,
  Service extends BaseService<T, CreateDto, UpdateDto>,
> {
  /**
   * The service to be used for CRUD operations
   */
  protected abstract readonly service: Service;

  /**
   * The entity name for response messages
   */
  protected abstract readonly entityName: string;

  /**
   * Create a new entity
   */
  @Post()
  @ApiOperation({
    summary: `Create a new ${this.entityName}`,
    description: `Creates a new ${this.entityName} with the provided details`,
  })
  async create(@Body() createDto: CreateDto): Promise<BaseResponseDto<ResponseDto>> {
    const entity = await this.service.create(createDto);
    return new BaseResponseDto(
      this.mapToResponseDto(entity),
      `${this.entityName} created successfully`
    );
  }

  /**
   * Get all entities with pagination
   */
  @Get()
  @ApiOperation({
    summary: `Get all ${this.entityName}s`,
    description: `Retrieves a paginated list of all ${this.entityName}s`,
  })
  async findAll(
    @Query() paginationDto: PaginationRequestDto
  ): Promise<BaseResponseDto<ResponseDto[]>> {
    const result = await this.service.findAll(paginationDto);
    return new BaseResponseDto(
      result.items.map(item => this.mapToResponseDto(item)),
      `${this.entityName}s retrieved successfully`
    );
  }

  /**
   * Get an entity by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: `Get a ${this.entityName} by ID`,
    description: `Retrieves a specific ${this.entityName} by its unique identifier`,
  })
  @ApiParam({ name: 'id', description: `The ID of the ${this.entityName} to retrieve` })
  async findById(@Param('id') id: string): Promise<BaseResponseDto<ResponseDto>> {
    const entity = await this.service.findById(id);
    return new BaseResponseDto(
      this.mapToResponseDto(entity),
      `${this.entityName} retrieved successfully`
    );
  }

  /**
   * Update an entity
   */
  @Put(':id')
  @ApiOperation({
    summary: `Update a ${this.entityName}`,
    description: `Updates a ${this.entityName} with the provided details`,
  })
  @ApiParam({ name: 'id', description: `The ID of the ${this.entityName} to update` })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDto
  ): Promise<BaseResponseDto<ResponseDto>> {
    const entity = await this.service.update(id, updateDto);
    return new BaseResponseDto(
      this.mapToResponseDto(entity),
      `${this.entityName} updated successfully`
    );
  }

  /**
   * Delete an entity
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: `Delete a ${this.entityName}`,
    description: `Deletes a ${this.entityName} by its unique identifier`,
  })
  @ApiParam({ name: 'id', description: `The ID of the ${this.entityName} to delete` })
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }

  /**
   * Map an entity to a response DTO
   * This method must be implemented by child classes
   */
  protected abstract mapToResponseDto(entity: T): ResponseDto;
}
