import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { BaseEvent } from './event.payloads';
import { EventTypes } from './event.types';

@Injectable()
export class EventService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Emit an event with the provided payload
   * @param eventType Event type from EventTypes enum
   * @param payload Event payload data
   */
  emitEvent<T extends BaseEvent>(
    eventType: EventTypes,
    payload: Omit<T, 'timestamp' | 'correlationId'>
  ): void {
    const event: BaseEvent = {
      ...payload,
      timestamp: new Date(),
      correlationId: uuidv4(),
    };

    this.eventEmitter.emit(eventType, event);
  }

  /**
   * Helper method to emit a story created event
   */
  emitStoryCreated(storyId: string, title: string, userId: string): void {
    this.emitEvent(EventTypes.STORY_CREATED, {
      storyId,
      title,
      userId,
    });
  }

  /**
   * Helper method to emit a story updated event
   */
  emitStoryUpdated(storyId: string, updatedFields: string[]): void {
    this.emitEvent(EventTypes.STORY_UPDATED, {
      storyId,
      updatedFields,
    });
  }

  /**
   * Helper method to emit a sketch created event
   */
  emitSketchCreated(sketchId: string, storyId: string, imageUrl: string, userId: string): void {
    this.emitEvent(EventTypes.SKETCH_CREATED, {
      sketchId,
      storyId,
      imageUrl,
      userId,
    });
  }

  /**
   * Helper method to emit an order created event
   */
  emitOrderCreated(orderId: string, userId: string, productId: string, amount: number): void {
    this.emitEvent(EventTypes.ORDER_CREATED, {
      orderId,
      userId,
      productId,
      amount,
    });
  }

  /**
   * Helper method to emit an order completed event
   */
  emitOrderCompleted(orderId: string): void {
    this.emitEvent(EventTypes.ORDER_COMPLETED, {
      orderId,
      completionDate: new Date(),
    });
  }
}
