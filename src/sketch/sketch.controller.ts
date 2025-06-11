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
import { GenerateSketchDto } from './dto/generate-sketch.dto';
import { JobProducerService } from '../queue/services/job-producer.service';
import { JobType, SketchGenerationJobData, JobPriority } from '../queue/interfaces/job.interface';
import { SketchStatusService } from './services/sketch-status.service';
// import { PaginationRequestDto } from '../common/dto/pagination.dto';
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
  constructor(
    private readonly sketchService: SketchService,
    private readonly jobProducer: JobProducerService,
    private readonly statusService: SketchStatusService,
  ) {}

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

  @Post('generate')
  @ApiOperation({ 
    summary: 'Generate AI sketches', 
    description: 'Generates AI sketches for a story using emotion tags and style preferences. This creates a background job and returns immediately.' 
  })
  @ApiSuccessResponse(Object, { description: 'Sketch generation job created successfully' })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data', 'VALIDATION_ERROR')
  @ApiErrorResponse(HttpStatus.TOO_MANY_REQUESTS, 'User quota exceeded', 'QUOTA_EXCEEDED')
  async generateSketches(
    @Body() generateDto: GenerateSketchDto
  ): Promise<BaseResponseDto<{ jobId: string; message: string; status: string }>> {
    const userId = generateDto.userId || 'anonymous';
    
    // Check user quota
    const quotaCheck = await this.statusService.checkUserQuota(userId);
    if (!quotaCheck.allowed) {
      throw new Error(`User quota exceeded. Daily: ${quotaCheck.quotaInfo.dailyUsed}/${quotaCheck.quotaInfo.dailyLimit}, Monthly: ${quotaCheck.quotaInfo.monthlyUsed}/${quotaCheck.quotaInfo.monthlyLimit}`);
    }

    // Create job data with the new format
    const jobData: SketchGenerationJobData = {
      storyId: generateDto.storyId,
      storyText: generateDto.storyText,
      emotionTags: generateDto.emotionTags,
      style: generateDto.style,
      variants: generateDto.variants || 1,
      additionalContext: generateDto.additionalContext,
      userId,
      timestamp: new Date(),
      // Include legacy fields for backward compatibility
      prompt: `Generated from story: ${generateDto.storyText}`,
    };

    // Add job to queue using the correct method
    const jobId = await this.jobProducer.queueSketchGeneration(jobData, JobPriority.NORMAL);

    // Increment user usage
    await this.statusService.incrementUserUsage(userId);

    return new BaseResponseDto(
      {
        jobId: jobId,
        message: 'Sketch generation job created successfully',
        status: 'queued',
      },
      'Sketch generation started'
    );
  }

  @Get('generate/:jobId/status')
  @ApiOperation({ 
    summary: 'Get sketch generation job status', 
    description: 'Check the status and progress of a sketch generation job' 
  })
  @ApiParam({ name: 'jobId', description: 'Job ID returned from the generate endpoint' })
  @ApiSuccessResponse(Object, { description: 'Job status retrieved successfully' })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Job not found', 'JOB_NOT_FOUND')
  async getGenerationStatus(@Param('jobId') jobId: string): Promise<BaseResponseDto<any>> {
    const job = await this.statusService.getJob(jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }

    return new BaseResponseDto(job, 'Job status retrieved successfully');
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
    @Query('storyId') storyId?: string
  ): Promise<BaseResponseDto<SketchResponseDto[]>> {
    // Simplified version without pagination for now
    const result = await this.sketchService.findAll(undefined, storyId);
    return new BaseResponseDto(
      result.items.map((item: any) => this.sketchService.mapToResponseDto(item)),
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
