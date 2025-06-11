import { Module, OnModuleInit } from '@nestjs/common';
import { QueueService } from './services/queue.service';
import { JobProducerService } from './services/job-producer.service';
import { SketchGenerationProcessor } from './processors/sketch-generation.processor';
import { EmailNotificationProcessor } from './processors/email-notification.processor';
import { EmotionAnalysisProcessor } from './processors/emotion-analysis.processor';
import { PaymentProcessingProcessor } from './processors/payment-processing.processor';
import { QueueMonitorController } from './controllers/queue-monitor.controller';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '../config/config.module';
import { SketchModule } from '../sketch/sketch.module';
import { JobType } from './interfaces/job.interface';

@Module({
  imports: [RedisModule, ConfigModule, SketchModule],
  controllers: [QueueMonitorController],
  providers: [
    QueueService,
    JobProducerService,
    SketchGenerationProcessor,
    EmailNotificationProcessor,
    EmotionAnalysisProcessor,
    PaymentProcessingProcessor,
  ],
  exports: [QueueService, JobProducerService],
})
export class QueueModule implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly sketchProcessor: SketchGenerationProcessor,
    private readonly emailProcessor: EmailNotificationProcessor,
    private readonly emotionProcessor: EmotionAnalysisProcessor,
    private readonly paymentProcessor: PaymentProcessingProcessor,
  ) {}

  async onModuleInit(): Promise<void> {
    // Register all processors with the queue service
    this.queueService.registerProcessor(
      JobType.SKETCH_GENERATION,
      (job) => this.sketchProcessor.process(job),
    );

    this.queueService.registerProcessor(
      JobType.EMAIL_NOTIFICATION,
      (job) => this.emailProcessor.process(job),
    );

    this.queueService.registerProcessor(
      JobType.EMOTION_ANALYSIS,
      (job) => this.emotionProcessor.process(job),
    );

    this.queueService.registerProcessor(
      JobType.PAYMENT_PROCESSING,
      (job) => this.paymentProcessor.process(job),
    );
  }
} 