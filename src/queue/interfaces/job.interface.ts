export enum JobType {
  SKETCH_GENERATION = 'sketch-generation',
  EMOTION_ANALYSIS = 'emotion-analysis',
  EMAIL_NOTIFICATION = 'email-notification',
  PAYMENT_PROCESSING = 'payment-processing',
}

export enum JobPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 20,
}

export interface BaseJobData {
  userId?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface SketchGenerationJobData extends BaseJobData {
  storyId: string;
  storyText: string;
  emotionTags: Array<{
    name: string;
    intensity: number;
  }>;
  style: string;
  variants?: number;
  additionalContext?: string;
  // Legacy fields for backward compatibility
  prompt?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  quality?: 'draft' | 'standard' | 'high';
}

export interface EmotionAnalysisJobData extends BaseJobData {
  text?: string;
  imageUrl?: string;
  analysisType: 'text' | 'image' | 'combined';
}

export interface EmailNotificationJobData extends BaseJobData {
  to: string | string[];
  subject: string;
  template: string;
  templateData?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

export interface PaymentProcessingJobData extends BaseJobData {
  paymentId: string;
  amount: number;
  currency: string;
  action: 'capture' | 'refund' | 'verify';
  metadata?: Record<string, any>;
}

export type JobData = 
  | SketchGenerationJobData 
  | EmotionAnalysisJobData 
  | EmailNotificationJobData 
  | PaymentProcessingJobData;

export interface JobOptions {
  priority?: JobPriority;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: number;
  removeOnFail?: number;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime?: number;
  metadata?: Record<string, any>;
} 