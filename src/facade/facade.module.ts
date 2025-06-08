import { Module } from '@nestjs/common';
import { StoryModule } from '../story/story.module';
import { SketchModule } from '../sketch/sketch.module';
import { StorySketchFacade } from '../story/story-sketch.facade';
import { FacadeController } from './facade.controller';

@Module({
  imports: [StoryModule, SketchModule],
  controllers: [FacadeController],
  providers: [StorySketchFacade],
  exports: [StorySketchFacade],
})
export class FacadeModule {}
