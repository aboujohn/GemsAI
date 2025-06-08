import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventTypes } from '../common/events/event.types';
import { StoryCreatedEvent, StoryDeletedEvent } from '../common/events/event.payloads';
import { SketchService } from './sketch.service';

/**
 * Event listener for sketch-related events
 * This demonstrates how to listen to events from other modules
 */
@Injectable()
export class SketchEventListener {
  private readonly logger = new Logger(SketchEventListener.name);

  constructor(private readonly sketchService: SketchService) {}

  /**
   * Listen for story creation events
   * Could be used to create default sketches for new stories
   */
  @OnEvent(EventTypes.STORY_CREATED)
  async handleStoryCreatedEvent(event: StoryCreatedEvent): Promise<void> {
    this.logger.log(`Story created with ID: ${event.storyId}. Title: ${event.title}`);

    // Here you could automatically create a default sketch for each new story
    // For now, we're just logging the event
  }

  /**
   * Listen for story deletion events
   * Used to delete all sketches associated with a deleted story
   */
  @OnEvent(EventTypes.STORY_DELETED)
  async handleStoryDeletedEvent(event: StoryDeletedEvent): Promise<void> {
    this.logger.log(`Story deleted with ID: ${event.storyId}. Cleaning up associated sketches.`);

    // In a real implementation, this would delete all sketches associated with the story
    // For example:
    // const result = await this.sketchService.findAll({ page: 1, limit: 100 }, event.storyId);
    // for (const sketch of result.items) {
    //   await this.sketchService.remove(sketch.id);
    // }
  }
}
