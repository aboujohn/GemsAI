import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { StorageService } from './storage.service';
import { S3Service } from './s3.service';
import { FileValidationService } from './file-validation.service';
import { ImageOptimizationService } from './image-optimization.service';
import { StorageController } from './storage.controller';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [
    StorageService,
    S3Service,
    FileValidationService,
    ImageOptimizationService,
  ],
  exports: [
    StorageService,
    S3Service,
    FileValidationService,
    ImageOptimizationService,
  ],
})
export class StorageModule {} 