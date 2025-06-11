import { Module } from '@nestjs/common';
import { SketchController } from './sketch.controller';
import { SketchService } from './sketch.service';
import { SketchEventListener } from './sketch.event-listener';
import { PromptConstructionService } from './services/prompt-construction.service';
import { ImageGenerationService } from './services/image-generation.service';
import { SketchStatusService } from './services/sketch-status.service';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '../config/config.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [CommonModule, ConfigModule, StorageModule],
  controllers: [SketchController],
  providers: [
    SketchService, 
    SketchEventListener, 
    PromptConstructionService, 
    ImageGenerationService,
    SketchStatusService
  ],
  exports: [
    SketchService, 
    PromptConstructionService, 
    ImageGenerationService,
    SketchStatusService
  ],
})
export class SketchModule {}
