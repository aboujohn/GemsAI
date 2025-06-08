import { Module } from '@nestjs/common';
import { SketchController } from './sketch.controller';
import { SketchService } from './sketch.service';
import { SketchEventListener } from './sketch.event-listener';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [SketchController],
  providers: [SketchService, SketchEventListener],
  exports: [SketchService],
})
export class SketchModule {}
