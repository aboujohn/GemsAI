import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { RedisService } from '../../redis/redis.service';
import { ConfigService } from '../../config/config.service';
import { 
  JobType, 
  JobData, 
  JobOptions, 
  JobResult, 
  JobPriority 
} from '../interfaces/job.interface';

interface InMemoryJob {
  id: string;
  type: JobType;
  data: JobData;
  options: JobOptions;
  createdAt: Date;
  attempts: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private queues = new Map<JobType, Queue>();
  private workers = new Map<JobType, Worker>();
  private processors = new Map<JobType, (job: Job) => Promise<JobResult>>();
  
  // Fallback in-memory queue for when Redis is disabled
  private inMemoryJobs = new Map<string, InMemoryJob>();
  private jobCounter = 0;
  private processingInterval: NodeJS.Timeout | null = null;
  
  private readonly redisEnabled: boolean;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.redisEnabled = this.configService.redisEnabled;
  }

  async onModuleInit(): Promise<void> {
    if (this.redisEnabled && this.redisService.isAvailable()) {
      await this.initializeBullMQQueues();
    } else {
      this.initializeInMemoryQueue();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    // Close BullMQ workers and queues
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    
    for (const queue of this.queues.values()) {
      await queue.close();
    }
  }

  private async initializeBullMQQueues(): Promise<void> {
    this.logger.log('Initializing BullMQ queues with Redis');
    
    const redisConnection = {
      host: this.configService.redisHost,
      port: this.configService.redisPort,
      password: this.configService.redisPassword,
      db: this.configService.redisDb,
    };

    // Initialize queues for each job type
    for (const jobType of Object.values(JobType)) {
      const queue = new Queue(jobType, {
        connection: redisConnection,
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      });

      this.queues.set(jobType, queue);
    }

    this.logger.log(`Initialized ${this.queues.size} BullMQ queues`);
  }

  private initializeInMemoryQueue(): void {
    this.logger.log('Initializing in-memory job queue (Redis disabled)');
    
    // Start processing interval for in-memory jobs
    this.processingInterval = setInterval(() => {
      this.processInMemoryJobs();
    }, 1000); // Process every second
  }

  /**
   * Add a job to the queue
   */
  async addJob(
    type: JobType, 
    data: JobData, 
    options: JobOptions = {}
  ): Promise<string> {
    if (this.redisEnabled && this.redisService.isAvailable()) {
      return this.addBullMQJob(type, data, options);
    } else {
      return this.addInMemoryJob(type, data, options);
    }
  }

  private async addBullMQJob(
    type: JobType, 
    data: JobData, 
    options: JobOptions
  ): Promise<string> {
    const queue = this.queues.get(type);
    if (!queue) {
      throw new Error(`Queue for job type ${type} not found`);
    }

    const job = await queue.add(type, data, {
      priority: options.priority || JobPriority.NORMAL,
      delay: options.delay,
      attempts: options.attempts || 3,
      backoff: options.backoff,
      removeOnComplete: options.removeOnComplete,
      removeOnFail: options.removeOnFail,
    });

    this.logger.debug(`Added BullMQ job ${job.id} of type ${type}`);
    return job.id!;
  }

  private addInMemoryJob(
    type: JobType, 
    data: JobData, 
    options: JobOptions
  ): string {
    const id = `job_${++this.jobCounter}`;
    const job: InMemoryJob = {
      id,
      type,
      data,
      options,
      createdAt: new Date(),
      attempts: 0,
      status: 'waiting',
    };

    this.inMemoryJobs.set(id, job);
    this.logger.debug(`Added in-memory job ${id} of type ${type}`);
    return id;
  }

  /**
   * Register a processor for a specific job type
   */
  registerProcessor(
    type: JobType, 
    processor: (job: Job) => Promise<JobResult>
  ): void {
    this.processors.set(type, processor);

    if (this.redisEnabled && this.redisService.isAvailable()) {
      this.createBullMQWorker(type, processor);
    }
    
    this.logger.log(`Registered processor for job type: ${type}`);
  }

  private createBullMQWorker(
    type: JobType, 
    processor: (job: Job) => Promise<JobResult>
  ): void {
    const redisConnection = {
      host: this.configService.redisHost,
      port: this.configService.redisPort,
      password: this.configService.redisPassword,
      db: this.configService.redisDb,
    };

    const worker = new Worker(type, async (job: Job) => {
      const startTime = Date.now();
      try {
        this.logger.debug(`Processing BullMQ job ${job.id} of type ${type}`);
        const result = await processor(job);
        const processingTime = Date.now() - startTime;
        
        return {
          ...result,
          processingTime,
        };
      } catch (error) {
        this.logger.error(`BullMQ job ${job.id} failed:`, error);
        throw error;
      }
    }, {
      connection: redisConnection,
      concurrency: this.getConcurrencyForJobType(type),
    });

    worker.on('completed', (job) => {
      this.logger.log(`BullMQ job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      this.logger.error(`BullMQ job ${job?.id} failed:`, err);
    });

    this.workers.set(type, worker);
  }

  private async processInMemoryJobs(): Promise<void> {
    const waitingJobs = Array.from(this.inMemoryJobs.values())
      .filter(job => job.status === 'waiting')
      .sort((a, b) => {
        // Sort by priority (higher first), then by creation time
        const priorityA = a.options.priority || JobPriority.NORMAL;
        const priorityB = b.options.priority || JobPriority.NORMAL;
        
        if (priorityA !== priorityB) {
          return priorityB - priorityA;
        }
        
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    // Process up to 5 jobs per interval to avoid blocking
    const jobsToProcess = waitingJobs.slice(0, 5);
    
    for (const job of jobsToProcess) {
      await this.processInMemoryJob(job);
    }
  }

  private async processInMemoryJob(job: InMemoryJob): Promise<void> {
    const processor = this.processors.get(job.type);
    if (!processor) {
      this.logger.warn(`No processor found for job type ${job.type}`);
      return;
    }

    job.status = 'active';
    job.attempts++;

    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing in-memory job ${job.id} of type ${job.type}`);
      
      // Create a mock BullMQ job object
      const mockJob = {
        id: job.id,
        data: job.data,
        opts: job.options,
        attemptsMade: job.attempts,
      } as Job;

      const result = await processor(mockJob);
      const processingTime = Date.now() - startTime;
      
      job.status = 'completed';
      this.logger.log(`In-memory job ${job.id} completed in ${processingTime}ms`);
      
      // Remove completed job after a delay
      setTimeout(() => {
        this.inMemoryJobs.delete(job.id);
      }, 60000); // Keep for 1 minute
      
    } catch (error) {
      job.status = 'failed';
      this.logger.error(`In-memory job ${job.id} failed:`, error);
      
      const maxAttempts = job.options.attempts || 3;
      if (job.attempts < maxAttempts) {
        // Retry after delay
        const delay = job.options.backoff?.delay || 5000;
        setTimeout(() => {
          if (this.inMemoryJobs.has(job.id)) {
            job.status = 'waiting';
          }
        }, delay);
      } else {
        // Remove failed job after a delay
        setTimeout(() => {
          this.inMemoryJobs.delete(job.id);
        }, 300000); // Keep for 5 minutes
      }
    }
  }

  private getConcurrencyForJobType(type: JobType): number {
    switch (type) {
      case JobType.SKETCH_GENERATION:
        return 2; // CPU intensive
      case JobType.EMOTION_ANALYSIS:
        return 3; // Moderate load
      case JobType.EMAIL_NOTIFICATION:
        return 10; // Light load
      case JobType.PAYMENT_PROCESSING:
        return 5; // Moderate load, critical
      default:
        return 1;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(type: JobType): Promise<any> {
    if (this.redisEnabled && this.redisService.isAvailable()) {
      const queue = this.queues.get(type);
      if (queue) {
        return await queue.getJobCounts();
      }
    } else {
      // Return in-memory stats
      const jobs = Array.from(this.inMemoryJobs.values()).filter(job => job.type === type);
      return {
        waiting: jobs.filter(job => job.status === 'waiting').length,
        active: jobs.filter(job => job.status === 'active').length,
        completed: jobs.filter(job => job.status === 'completed').length,
        failed: jobs.filter(job => job.status === 'failed').length,
      };
    }
    
    return null;
  }

  /**
   * Get overall queue health
   */
  async getQueueHealth(): Promise<Record<string, any>> {
    const health: Record<string, any> = {
      redisEnabled: this.redisEnabled,
      redisAvailable: this.redisService.isAvailable(),
      queues: {},
    };

    for (const type of Object.values(JobType)) {
      health.queues[type] = await this.getQueueStats(type);
    }

    return health;
  }

  /**
   * Clear all jobs from a queue (useful for testing)
   */
  async clearQueue(type: JobType): Promise<void> {
    if (this.redisEnabled && this.redisService.isAvailable()) {
      const queue = this.queues.get(type);
      if (queue) {
        await queue.obliterate({ force: true });
      }
    } else {
      // Clear in-memory jobs
      const jobsToDelete = Array.from(this.inMemoryJobs.keys())
        .filter(id => this.inMemoryJobs.get(id)?.type === type);
      
      jobsToDelete.forEach(id => this.inMemoryJobs.delete(id));
    }
    
    this.logger.log(`Cleared queue for job type: ${type}`);
  }
} 