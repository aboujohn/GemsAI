import { Controller, Get, Param, Post, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QueueService } from '../services/queue.service';
import { JobType } from '../interfaces/job.interface';
import { SketchStatusService, SketchGenerationStatus } from '../../sketch/services/sketch-status.service';

@ApiTags('Queue Monitoring')
@Controller('queue')
export class QueueMonitorController {
  constructor(
    private readonly queueService: QueueService,
    private readonly sketchStatusService: SketchStatusService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Get overall queue health status' })
  @ApiResponse({ status: 200, description: 'Queue health information' })
  async getQueueHealth() {
    return await this.queueService.getQueueHealth();
  }

  @Get('stats/:type')
  @ApiOperation({ summary: 'Get statistics for a specific queue type' })
  @ApiParam({ name: 'type', enum: JobType, description: 'Queue type' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  async getQueueStats(@Param('type') type: JobType) {
    return await this.queueService.getQueueStats(type);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get statistics for all queue types' })
  @ApiResponse({ status: 200, description: 'All queue statistics' })
  async getAllQueueStats() {
    const stats: Record<string, any> = {};
    
    for (const type of Object.values(JobType)) {
      stats[type] = await this.queueService.getQueueStats(type);
    }
    
    return stats;
  }

  @Delete('clear/:type')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all jobs from a specific queue (DANGER!)' })
  @ApiParam({ name: 'type', enum: JobType, description: 'Queue type to clear' })
  @ApiResponse({ status: 204, description: 'Queue cleared successfully' })
  async clearQueue(@Param('type') type: JobType) {
    await this.queueService.clearQueue(type);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard data with all queue information' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  async getDashboard() {
    const health = await this.queueService.getQueueHealth();
    const stats: Record<string, any> = {};
    
    for (const type of Object.values(JobType)) {
      stats[type] = await this.queueService.getQueueStats(type);
    }

    return {
      timestamp: new Date().toISOString(),
      health,
      stats,
      jobTypes: Object.values(JobType),
      summary: this.generateSummary(stats),
    };
  }

  private generateSummary(stats: Record<string, any>) {
    let totalWaiting = 0;
    let totalActive = 0;
    let totalCompleted = 0;
    let totalFailed = 0;

    Object.values(stats).forEach((queueStats: any) => {
      if (queueStats) {
        totalWaiting += queueStats.waiting || 0;
        totalActive += queueStats.active || 0;
        totalCompleted += queueStats.completed || 0;
        totalFailed += queueStats.failed || 0;
      }
    });

    return {
      total: {
        waiting: totalWaiting,
        active: totalActive,
        completed: totalCompleted,
        failed: totalFailed,
      },
      health: totalFailed / (totalCompleted + totalFailed + 1) < 0.1 ? 'healthy' : 'degraded',
    };
  }

  // Sketch Generation Monitoring Endpoints

  @Get('sketches/stats')
  @ApiOperation({ summary: 'Get sketch generation statistics' })
  @ApiQuery({ name: 'timeframe', required: false, enum: ['hour', 'day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: 'Sketch generation statistics' })
  async getSketchStats(@Query('timeframe') timeframe?: 'hour' | 'day' | 'week' | 'month') {
    return await this.sketchStatusService.getStatistics(timeframe);
  }

  @Get('sketches/health')
  @ApiOperation({ summary: 'Get sketch generation queue health' })
  @ApiResponse({ status: 200, description: 'Sketch queue health metrics' })
  async getSketchQueueHealth() {
    return await this.sketchStatusService.getQueueHealth();
  }

  @Get('sketches/job/:jobId')
  @ApiOperation({ summary: 'Get specific sketch generation job details' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job details' })
  async getSketchJob(@Param('jobId') jobId: string) {
    return await this.sketchStatusService.getJob(jobId);
  }

  @Get('sketches/jobs/user/:userId')
  @ApiOperation({ summary: 'Get sketch generation jobs for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'User sketch jobs' })
  async getUserSketchJobs(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ) {
    return await this.sketchStatusService.getJobsByUser(userId, limit);
  }

  @Get('sketches/jobs/story/:storyId')
  @ApiOperation({ summary: 'Get sketch generation jobs for a specific story' })
  @ApiParam({ name: 'storyId', description: 'Story ID' })
  @ApiResponse({ status: 200, description: 'Story sketch jobs' })
  async getStorySketchJobs(@Param('storyId') storyId: string) {
    return await this.sketchStatusService.getJobsByStory(storyId);
  }

  @Get('sketches/jobs/status/:status')
  @ApiOperation({ summary: 'Get sketch generation jobs by status' })
  @ApiParam({ name: 'status', enum: SketchGenerationStatus })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Jobs by status' })
  async getSketchJobsByStatus(
    @Param('status') status: SketchGenerationStatus,
    @Query('limit') limit?: number
  ) {
    return await this.sketchStatusService.getJobsByStatus(status, limit);
  }

  @Get('sketches/quota/:userId')
  @ApiOperation({ summary: 'Get user quota information' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User quota info' })
  async getUserQuota(@Param('userId') userId: string) {
    return await this.sketchStatusService.checkUserQuota(userId);
  }

  @Post('sketches/cleanup')
  @ApiOperation({ summary: 'Cleanup old completed sketch jobs' })
  @ApiQuery({ name: 'days', required: false, type: 'number', description: 'Days older than which to clean up (default 30)' })
  @ApiResponse({ status: 200, description: 'Number of jobs cleaned up' })
  async cleanupOldSketchJobs(@Query('days') days?: number) {
    const removed = await this.sketchStatusService.cleanupOldJobs(days);
    return { cleanedUp: removed, olderThanDays: days || 30 };
  }
} 