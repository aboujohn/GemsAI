import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SketchService } from './sketch.service';
import { CreateSketchDto } from './dto/create-sketch.dto';
import { UpdateSketchDto } from './dto/update-sketch.dto';
import { SketchResponseDto } from './dto/sketch-response.dto';
import { PaginationRequestDto } from '../common/dto/pagination.dto';
import { ApiSuccessResponse, ApiErrorResponse } from '../common/decorators/api-response.decorator';
import { BaseResponseDto } from '../common/dto/base-response.dto';

// Temporary interface until we create proper entities/DTOs
interface Sketch {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  storyId: string;
  imageUrl: string;
  description: string;
}

@ApiTags('sketches')
@Controller('sketches')
export class SketchController {
  constructor(private readonly sketchService: SketchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sketch', description: 'Creates a new sketch for a story' })
  @ApiSuccessResponse(SketchResponseDto, { description: 'Sketch created successfully' })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data', 'VALIDATION_ERROR')
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Story not found', 'STORY_NOT_FOUND')
  async create(
    @Body() createSketchDto: CreateSketchDto
  ): Promise<BaseResponseDto<SketchResponseDto>> {
    const sketch = await this.sketchService.create(createSketchDto);
    return new BaseResponseDto(
      this.sketchService.mapToResponseDto(sketch),
      'Sketch created successfully'
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all sketches',
    description: 'Retrieves a paginated list of all sketches',
  })
  @ApiSuccessResponse(SketchResponseDto, {
    description: 'Sketches retrieved successfully',
    isArray: true,
  })
  @ApiQuery({ name: 'storyId', required: false, description: 'Filter sketches by story ID' })
  async findAll(
    @Query() paginationDto: PaginationRequestDto,
    @Query('storyId') storyId?: string
  ): Promise<BaseResponseDto<SketchResponseDto[]>> {
    const result = await this.sketchService.findAll(paginationDto, storyId);
    return new BaseResponseDto(
      result.items.map(item => this.sketchService.mapToResponseDto(item)),
      'Sketches retrieved successfully'
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a sketch by ID',
    description: 'Retrieves a specific sketch by its unique identifier',
  })
  @ApiParam({ name: 'id', description: 'The ID of the sketch to retrieve', type: String })
  @ApiSuccessResponse(SketchResponseDto, { description: 'Sketch retrieved successfully' })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Sketch not found', 'SKETCH_NOT_FOUND')
  async findById(@Param('id') id: string): Promise<BaseResponseDto<SketchResponseDto>> {
    const sketch = await this.sketchService.findById(id);
    return new BaseResponseDto(
      this.sketchService.mapToResponseDto(sketch),
      'Sketch retrieved successfully'
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a sketch',
    description: 'Updates a sketch with the provided details',
  })
  @ApiParam({ name: 'id', description: 'The ID of the sketch to update', type: String })
  @ApiSuccessResponse(SketchResponseDto, { description: 'Sketch updated successfully' })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Sketch not found', 'SKETCH_NOT_FOUND')
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data', 'VALIDATION_ERROR')
  async update(
    @Param('id') id: string,
    @Body() updateSketchDto: UpdateSketchDto
  ): Promise<BaseResponseDto<SketchResponseDto>> {
    const sketch = await this.sketchService.update(id, updateSketchDto);
    return new BaseResponseDto(
      this.sketchService.mapToResponseDto(sketch),
      'Sketch updated successfully'
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a sketch',
    description: 'Deletes a sketch by its unique identifier',
  })
  @ApiParam({ name: 'id', description: 'The ID of the sketch to delete', type: String })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Sketch not found', 'SKETCH_NOT_FOUND')
  async remove(@Param('id') id: string): Promise<void> {
    await this.sketchService.remove(id);
  }
}
