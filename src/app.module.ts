import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { StoryModule } from './story/story.module';
import { SketchModule } from './sketch/sketch.module';
import { ProductModule } from './product/product.module';
import { JewelerModule } from './jeweler/jeweler.module';
import { GiftModule } from './gift/gift.module';
import { OrderModule } from './order/order.module';
import { CommonModule } from './common/common.module';
import { FacadeModule } from './facade/facade.module';
import { StorageModule } from './storage/storage.module';
import { QueueModule } from './queue/queue.module';
import { AppThrottlerModule } from './common/throttler/throttler.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule,
    AppThrottlerModule,
    EventEmitterModule.forRoot({
      // Global options for EventEmitter
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
    }),
    HealthModule,
    AuthModule,
    StoryModule,
    SketchModule,
    ProductModule,
    JewelerModule,
    GiftModule,
    OrderModule,
    CommonModule,
    FacadeModule,
    StorageModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
