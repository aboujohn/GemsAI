import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { StorySketchFacade } from '../story/story-sketch.facade';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';
import { PaginationRequestDto } from '../common/dto/pagination.dto';
import { StoryResponseDto } from '../story/dto/story-response.dto';
import { SketchResponseDto } from '../sketch/dto/sketch-response.dto';
import { BaseResponseDto } from '../common/dto/base-response.dto';

@ApiTags('dashboard')
@Controller('dashboard')
export class FacadeController {
  constructor(private readonly storySketchFacade: StorySketchFacade) {}

  @Get('story/:id/with-sketches')
  @ApiOperation({
    summary: 'Get a story with all its sketches',
    description: 'Retrieves a story and all sketches associated with it',
  })
  @ApiParam({ name: 'id', description: 'The ID of the story to retrieve with its sketches' })
  @ApiSuccessResponse(StoryResponseDto, {
    description: 'Story with sketches retrieved successfully',
  })
  async getStoryWithSketches(
    @Param('id') storyId: string
  ): Promise<BaseResponseDto<{ story: StoryResponseDto; sketches: SketchResponseDto[] }>> {
    const result = await this.storySketchFacade.getStoryWithSketches(storyId);
    return new BaseResponseDto(result, 'Story with sketches retrieved successfully');
  }

  @Get('user-content')
  @ApiOperation({
    summary: 'Get user dashboard data',
    description: 'Retrieves recent stories and sketches for the user dashboard',
  })
  @ApiSuccessResponse(Object, {
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboardData(@Query() paginationDto: PaginationRequestDto): Promise<
    BaseResponseDto<{
      recentStories: StoryResponseDto[];
      recentSketches: SketchResponseDto[];
    }>
  > {
    // Using a mock user ID since we don't have auth yet
    const result = await this.storySketchFacade.getDashboardData('mock-user-id', paginationDto);
    return new BaseResponseDto(result, 'Dashboard data retrieved successfully');
  }
}
