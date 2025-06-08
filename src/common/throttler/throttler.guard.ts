import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  // Override methods as needed to customize rate limiting
  protected getTracker(req: Record<string, any>): string {
    // Use IP address as the tracker
    return req.ip;
  }
}
