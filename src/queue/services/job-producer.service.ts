import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from './queue.service';
import { 
  JobType, 
  JobPriority, 
  SketchGenerationJobData,
  EmailNotificationJobData,
  EmotionAnalysisJobData,
  PaymentProcessingJobData,
} from '../interfaces/job.interface';

@Injectable()
export class JobProducerService {
  private readonly logger = new Logger(JobProducerService.name);

  constructor(private readonly queueService: QueueService) {}

  /**
   * Queue a sketch generation job
   */
  async queueSketchGeneration(
    data: SketchGenerationJobData,
    priority: JobPriority = JobPriority.NORMAL,
    delayMs?: number
  ): Promise<string> {
    this.logger.log(`Queuing sketch generation job for prompt: ${data.prompt}`);
    
    return await this.queueService.addJob(
      JobType.SKETCH_GENERATION,
      {
        ...data,
        timestamp: new Date(),
      },
      {
        priority,
        delay: delayMs,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 5,
        removeOnFail: 3,
      }
    );
  }

  /**
   * Queue an emotion analysis job
   */
  async queueEmotionAnalysis(
    data: EmotionAnalysisJobData,
    priority: JobPriority = JobPriority.NORMAL,
    delayMs?: number
  ): Promise<string> {
    this.logger.log(`Queuing emotion analysis job for type: ${data.analysisType}`);
    
    return await this.queueService.addJob(
      JobType.EMOTION_ANALYSIS,
      {
        ...data,
        timestamp: new Date(),
      },
      {
        priority,
        delay: delayMs,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 3000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      }
    );
  }

  /**
   * Queue an email notification job
   */
  async queueEmailNotification(
    data: EmailNotificationJobData,
    priority: JobPriority = JobPriority.NORMAL,
    delayMs?: number
  ): Promise<string> {
    const recipients = Array.isArray(data.to) ? data.to.length : 1;
    this.logger.log(`Queuing email notification to ${recipients} recipients`);
    
    return await this.queueService.addJob(
      JobType.EMAIL_NOTIFICATION,
      {
        ...data,
        timestamp: new Date(),
      },
      {
        priority,
        delay: delayMs,
        attempts: 5, // More attempts for emails
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 20,
        removeOnFail: 10,
      }
    );
  }

  /**
   * Queue a payment processing job
   */
  async queuePaymentProcessing(
    data: PaymentProcessingJobData,
    priority: JobPriority = JobPriority.HIGH, // Payments are high priority by default
    delayMs?: number
  ): Promise<string> {
    this.logger.log(`Queuing payment ${data.action} for amount: ${data.amount} ${data.currency}`);
    
    return await this.queueService.addJob(
      JobType.PAYMENT_PROCESSING,
      {
        ...data,
        timestamp: new Date(),
      },
      {
        priority,
        delay: delayMs,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 10000, // Longer delay for payment retries
        },
        removeOnComplete: 15,
        removeOnFail: 10,
      }
    );
  }

  /**
   * Convenience method to send a welcome email
   */
  async sendWelcomeEmail(
    to: string,
    userName: string,
    userId?: string
  ): Promise<string> {
    return await this.queueEmailNotification({
      to,
      subject: 'Welcome to GemsAI!',
      template: 'welcome',
      templateData: {
        userName,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      },
      priority: 'normal',
      userId,
    });
  }

  /**
   * Convenience method to send a sketch completion notification
   */
  async sendSketchCompletionEmail(
    to: string,
    sketchUrl: string,
    userId?: string
  ): Promise<string> {
    return await this.queueEmailNotification({
      to,
      subject: 'Your sketch is ready!',
      template: 'sketch-completion',
      templateData: {
        sketchUrl,
        viewUrl: `${process.env.FRONTEND_URL}/sketches`,
      },
      priority: 'high',
      userId,
    }, JobPriority.HIGH);
  }

  /**
   * Convenience method to process a payment capture
   */
  async capturePayment(
    paymentId: string,
    amount: number,
    currency: string = 'USD',
    userId?: string
  ): Promise<string> {
    return await this.queuePaymentProcessing({
      paymentId,
      amount,
      currency,
      action: 'capture',
      userId,
      metadata: {
        capturedAt: new Date().toISOString(),
      },
    }, JobPriority.CRITICAL);
  }

  /**
   * Convenience method to analyze text emotion for personalization
   */
  async analyzeTextEmotion(
    text: string,
    userId?: string
  ): Promise<string> {
    return await this.queueEmotionAnalysis({
      text,
      analysisType: 'text',
      userId,
      metadata: {
        source: 'user-input',
      },
    });
  }
} 