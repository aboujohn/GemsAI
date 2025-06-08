/**
 * Base event interface that all events extend
 */
export interface BaseEvent {
  timestamp: Date;
  correlationId: string;
}

/**
 * Story event payloads
 */
export interface StoryCreatedEvent extends BaseEvent {
  storyId: string;
  title: string;
  userId: string;
}

export interface StoryUpdatedEvent extends BaseEvent {
  storyId: string;
  updatedFields: string[];
}

export interface StoryDeletedEvent extends BaseEvent {
  storyId: string;
}

/**
 * Sketch event payloads
 */
export interface SketchCreatedEvent extends BaseEvent {
  sketchId: string;
  storyId: string;
  imageUrl: string;
  userId: string;
}

export interface SketchUpdatedEvent extends BaseEvent {
  sketchId: string;
  storyId: string;
  updatedFields: string[];
}

export interface SketchDeletedEvent extends BaseEvent {
  sketchId: string;
  storyId: string;
}

/**
 * Order event payloads
 */
export interface OrderCreatedEvent extends BaseEvent {
  orderId: string;
  userId: string;
  productId: string;
  amount: number;
}

export interface OrderUpdatedEvent extends BaseEvent {
  orderId: string;
  updatedFields: string[];
  previousStatus?: string;
  newStatus?: string;
}

export interface OrderCompletedEvent extends BaseEvent {
  orderId: string;
  completionDate: Date;
}

export interface OrderCancelledEvent extends BaseEvent {
  orderId: string;
  cancellationReason?: string;
}

/**
 * Authentication event payloads
 */
export interface UserRegisteredEvent extends BaseEvent {
  userId: string;
  email: string;
}

export interface UserLoggedInEvent extends BaseEvent {
  userId: string;
  email: string;
  deviceInfo?: string;
}
