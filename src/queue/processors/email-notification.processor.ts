import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailNotificationJobData, JobResult } from '../interfaces/job.interface';

@Injectable()
export class EmailNotificationProcessor {
  private readonly logger = new Logger(EmailNotificationProcessor.name);

  async process(job: Job<EmailNotificationJobData>): Promise<JobResult> {
    this.logger.log(`Processing email notification job ${job.id}`);
    
    try {
      const { to, subject, template, templateData, priority } = job.data;
      
      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      // For now, simulate email sending
      await this.simulateEmailSending(priority || 'normal');
      
      const recipients = Array.isArray(to) ? to : [to];
      
      // Mock result - replace with actual email service response
      const mockResult = {
        messageId: `msg_${job.id}_${Date.now()}`,
        recipients: recipients.length,
        subject,
        template,
        sentAt: new Date().toISOString(),
        status: 'sent',
      };

      this.logger.log(`Email notification job ${job.id} sent to ${recipients.length} recipients`);
      
      return {
        success: true,
        data: mockResult,
        metadata: {
          recipients: recipients.length,
          priority: priority || 'normal',
        },
      };
      
    } catch (error) {
      this.logger.error(`Email notification job ${job.id} failed:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          jobId: job.id,
          attempts: job.attemptsMade,
        },
      };
    }
  }

  private async simulateEmailSending(priority: string): Promise<void> {
    // Simulate different processing times based on priority
    const delay = priority === 'high' ? 500 : priority === 'low' ? 2000 : 1000;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
} 