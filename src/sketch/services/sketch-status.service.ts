import { Injectable, Logger } from '@nestjs/common';

export enum SketchGenerationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface SketchGenerationJob {
  id: string;
  storyId: string;
  userId: string;
  status: SketchGenerationStatus;
  style: string;
  variants: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata?: {
    provider?: string;
    cost?: number;
    processingTimeMs?: number;
    attempts?: number;
  };
}

export interface GenerationStatistics {
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  totalCost: number;
  successRate: number;
}

export interface UserQuota {
  userId: string;
  dailyLimit: number;
  dailyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
  lastReset: Date;
}

@Injectable()
export class SketchStatusService {
  private readonly logger = new Logger(SketchStatusService.name);
  
  // In-memory storage for development - replace with database in production
  private readonly jobs: Map<string, SketchGenerationJob> = new Map();
  private readonly userQuotas: Map<string, UserQuota> = new Map();

  /**
   * Create a new sketch generation job entry
   */
  async createJob(jobData: {
    id: string;
    storyId: string;
    userId: string;
    style: string;
    variants: number;
  }): Promise<SketchGenerationJob> {
    const job: SketchGenerationJob = {
      ...jobData,
      status: SketchGenerationStatus.PENDING,
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);
    this.logger.log(`Created sketch generation job ${job.id} for story ${job.storyId}`);
    
    return job;
  }

  /**
   * Update job status
   */
  async updateJobStatus(
    jobId: string, 
    status: SketchGenerationStatus, 
    metadata?: Partial<SketchGenerationJob['metadata']>,
    error?: string
  ): Promise<SketchGenerationJob | null> {
    const job = this.jobs.get(jobId);
    if (!job) {
      this.logger.warn(`Job ${jobId} not found for status update`);
      return null;
    }

    const now = new Date();
    
    // Update status and timestamps
    job.status = status;
    if (status === SketchGenerationStatus.PROCESSING && !job.startedAt) {
      job.startedAt = now;
    }
    if ([SketchGenerationStatus.COMPLETED, SketchGenerationStatus.FAILED, SketchGenerationStatus.CANCELLED].includes(status)) {
      job.completedAt = now;
    }
    
    // Update metadata
    if (metadata) {
      job.metadata = { ...job.metadata, ...metadata };
    }
    
    // Update error if provided
    if (error) {
      job.error = error;
    }

    this.jobs.set(jobId, job);
    this.logger.log(`Updated job ${jobId} status to ${status}`);
    
    return job;
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<SketchGenerationJob | null> {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get jobs by user ID
   */
  async getJobsByUser(userId: string, limit: number = 50): Promise<SketchGenerationJob[]> {
    const userJobs = Array.from(this.jobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return userJobs;
  }

  /**
   * Get jobs by story ID
   */
  async getJobsByStory(storyId: string): Promise<SketchGenerationJob[]> {
    const storyJobs = Array.from(this.jobs.values())
      .filter(job => job.storyId === storyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return storyJobs;
  }

  /**
   * Get jobs by status
   */
  async getJobsByStatus(status: SketchGenerationStatus, limit: number = 100): Promise<SketchGenerationJob[]> {
    const statusJobs = Array.from(this.jobs.values())
      .filter(job => job.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return statusJobs;
  }

  /**
   * Get generation statistics
   */
  async getStatistics(timeframe?: 'hour' | 'day' | 'week' | 'month'): Promise<GenerationStatistics> {
    let jobs = Array.from(this.jobs.values());
    
    // Filter by timeframe if provided
    if (timeframe) {
      const cutoff = this.getTimeframeCutoff(timeframe);
      jobs = jobs.filter(job => job.createdAt >= cutoff);
    }

    const totalJobs = jobs.length;
    const pendingJobs = jobs.filter(job => job.status === SketchGenerationStatus.PENDING).length;
    const processingJobs = jobs.filter(job => job.status === SketchGenerationStatus.PROCESSING).length;
    const completedJobs = jobs.filter(job => job.status === SketchGenerationStatus.COMPLETED).length;
    const failedJobs = jobs.filter(job => job.status === SketchGenerationStatus.FAILED).length;

    const completedJobsWithTime = jobs.filter(job => 
      job.status === SketchGenerationStatus.COMPLETED && 
      job.metadata?.processingTimeMs
    );
    
    const averageProcessingTime = completedJobsWithTime.length > 0
      ? completedJobsWithTime.reduce((sum, job) => sum + (job.metadata?.processingTimeMs || 0), 0) / completedJobsWithTime.length
      : 0;

    const totalCost = jobs.reduce((sum, job) => sum + (job.metadata?.cost || 0), 0);
    const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    return {
      totalJobs,
      pendingJobs,
      processingJobs,
      completedJobs,
      failedJobs,
      averageProcessingTime,
      totalCost,
      successRate,
    };
  }

  /**
   * Check user quota and rate limiting
   */
  async checkUserQuota(userId: string): Promise<{ allowed: boolean; quotaInfo: UserQuota }> {
    let quota = this.userQuotas.get(userId);
    
    if (!quota) {
      // Create default quota for new user
      quota = {
        userId,
        dailyLimit: 20, // Default daily limit
        dailyUsed: 0,
        monthlyLimit: 100, // Default monthly limit
        monthlyUsed: 0,
        lastReset: new Date(),
      };
      this.userQuotas.set(userId, quota);
    }

    // Reset quotas if needed
    quota = this.resetQuotasIfNeeded(quota);
    
    const allowed = quota.dailyUsed < quota.dailyLimit && quota.monthlyUsed < quota.monthlyLimit;
    
    return { allowed, quotaInfo: quota };
  }

  /**
   * Increment user usage
   */
  async incrementUserUsage(userId: string): Promise<void> {
    const quota = this.userQuotas.get(userId);
    if (quota) {
      quota.dailyUsed++;
      quota.monthlyUsed++;
      this.userQuotas.set(userId, quota);
    }
  }

  /**
   * Get queue health metrics
   */
  async getQueueHealth(): Promise<{
    queueLength: number;
    oldestPendingJob?: Date;
    averageWaitTime: number;
    failureRate: number;
  }> {
    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === SketchGenerationStatus.PENDING)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const processingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === SketchGenerationStatus.PROCESSING);

    const recentJobs = Array.from(this.jobs.values())
      .filter(job => {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return job.createdAt >= oneHourAgo;
      });

    const completedRecentJobs = recentJobs.filter(job => 
      job.status === SketchGenerationStatus.COMPLETED && job.startedAt && job.completedAt
    );

    const averageWaitTime = completedRecentJobs.length > 0
      ? completedRecentJobs.reduce((sum, job) => {
          const waitTime = job.startedAt!.getTime() - job.createdAt.getTime();
          return sum + waitTime;
        }, 0) / completedRecentJobs.length
      : 0;

    const failedRecentJobs = recentJobs.filter(job => job.status === SketchGenerationStatus.FAILED).length;
    const failureRate = recentJobs.length > 0 ? (failedRecentJobs / recentJobs.length) * 100 : 0;

    return {
      queueLength: pendingJobs.length + processingJobs.length,
      oldestPendingJob: pendingJobs.length > 0 ? pendingJobs[0].createdAt : undefined,
      averageWaitTime,
      failureRate,
    };
  }

  /**
   * Clean up old completed jobs
   */
  async cleanupOldJobs(olderThanDays: number = 30): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    let removedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.completedAt && job.completedAt < cutoff) {
        this.jobs.delete(jobId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.log(`Cleaned up ${removedCount} old jobs older than ${olderThanDays} days`);
    }

    return removedCount;
  }

  /**
   * Get timeframe cutoff date
   */
  private getTimeframeCutoff(timeframe: 'hour' | 'day' | 'week' | 'month'): Date {
    const now = new Date();
    
    switch (timeframe) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0);
    }
  }

  /**
   * Reset quotas if needed (daily/monthly reset)
   */
  private resetQuotasIfNeeded(quota: UserQuota): UserQuota {
    const now = new Date();
    const lastReset = quota.lastReset;
    
    // Check if it's a new day
    if (now.getDate() !== lastReset.getDate() || 
        now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
      quota.dailyUsed = 0;
    }
    
    // Check if it's a new month
    if (now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
      quota.monthlyUsed = 0;
    }
    
    quota.lastReset = now;
    this.userQuotas.set(quota.userId, quota);
    
    return quota;
  }
} 