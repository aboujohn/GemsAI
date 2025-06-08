import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '../../config/config.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: 60, // time to live - 60 seconds
        limit: configService.isDevelopment ? 100 : 20, // limit to 20 requests per ttl in production, 100 in dev
      }),
    }),
  ],
})
export class AppThrottlerModule {}
