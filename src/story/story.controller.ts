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
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryResponseDto } from './dto/story-response.dto';
import { PaginationRequestDto } from '../common/dto/pagination.dto';
import { ApiSuccessResponse, ApiErrorResponse } from '../common/decorators/api-response.decorator';
import { BaseResponseDto } from '../common/dto/base-response.dto';

// Temporary interface until we create proper entities/DTOs
interface Story {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
}

@ApiTags('stories')
@Controller('stories')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new story',
    description: 'Creates a new story with the provided details',
  })
  @ApiSuccessResponse(StoryResponseDto, { description: 'Story created successfully' })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data', 'VALIDATION_ERROR')
  async create(@Body() createStoryDto: CreateStoryDto): Promise<BaseResponseDto<StoryResponseDto>> {
    const story = await this.storyService.create(createStoryDto);
    return new BaseResponseDto(
      this.storyService.mapToResponseDto(story),
      'Story created successfully'
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all stories',
    description: 'Retrieves a paginated list of all stories',
  })
  @ApiSuccessResponse(StoryResponseDto, {
    description: 'Stories retrieved successfully',
    isArray: true,
  })
  async findAll(
    @Query() paginationDto: PaginationRequestDto
  ): Promise<BaseResponseDto<StoryResponseDto[]>> {
    const result = await this.storyService.findAll(paginationDto);
    return new BaseResponseDto(
      result.items.map(item => this.storyService.mapToResponseDto(item)),
      'Stories retrieved successfully'
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a story by ID',
    description: 'Retrieves a specific story by its unique identifier',
  })
  @ApiParam({ name: 'id', description: 'The ID of the story to retrieve', type: String })
  @ApiSuccessResponse(StoryResponseDto, { description: 'Story retrieved successfully' })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Story not found', 'STORY_NOT_FOUND')
  async findById(@Param('id') id: string): Promise<BaseResponseDto<StoryResponseDto>> {
    const story = await this.storyService.findById(id);
    return new BaseResponseDto(
      this.storyService.mapToResponseDto(story),
      'Story retrieved successfully'
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a story',
    description: 'Updates a story with the provided details',
  })
  @ApiParam({ name: 'id', description: 'The ID of the story to update', type: String })
  @ApiSuccessResponse(StoryResponseDto, { description: 'Story updated successfully' })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Story not found', 'STORY_NOT_FOUND')
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data', 'VALIDATION_ERROR')
  async update(
    @Param('id') id: string,
    @Body() updateStoryDto: UpdateStoryDto
  ): Promise<BaseResponseDto<StoryResponseDto>> {
    const story = await this.storyService.update(id, updateStoryDto);
    return new BaseResponseDto(
      this.storyService.mapToResponseDto(story),
      'Story updated successfully'
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a story',
    description: 'Deletes a story by its unique identifier',
  })
  @ApiParam({ name: 'id', description: 'The ID of the story to delete', type: String })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Story not found', 'STORY_NOT_FOUND')
  async remove(@Param('id') id: string): Promise<void> {
    await this.storyService.remove(id);
  }
}
