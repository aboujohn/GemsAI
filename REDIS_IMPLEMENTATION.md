# Redis and BullMQ Implementation for GemsAI

## Overview

This implementation provides a robust job processing system that can operate in two modes:

1. **Development Mode (Default)**: In-memory job processing
2. **Production Mode**: Redis + BullMQ for scalable job processing

## 🎯 Current Status

✅ **Completed:**
- Redis service with optional connection
- BullMQ queue infrastructure 
- Job processors for all job types
- In-memory fallback system
- Queue monitoring dashboard
- Job producer service
- Environment configuration

🔄 **Ready to Activate:**
- Set `REDIS_ENABLED=true` in environment
- Install Redis server
- Restart application

## 🚀 Quick Start

### Option 1: Continue with In-Memory (Current Setup)
No action needed! The system is already working in fallback mode.

### Option 2: Enable Redis for Production
```bash
# 1. Install Redis
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 2. Configure environment
echo "REDIS_ENABLED=true" >> .env.local

# 3. Restart application
npm run dev
```

## 📁 File Structure

```
src/
├── redis/
│   ├── redis.service.ts          # Redis connection & caching
│   └── redis.module.ts           # Redis module
├── queue/
│   ├── interfaces/
│   │   └── job.interface.ts      # Job type definitions
│   ├── services/
│   │   ├── queue.service.ts      # Core queue management
│   │   └── job-producer.service.ts # Easy job creation
│   ├── processors/
│   │   ├── sketch-generation.processor.ts
│   │   ├── email-notification.processor.ts
│   │   ├── emotion-analysis.processor.ts
│   │   └── payment-processing.processor.ts
│   ├── controllers/
│   │   └── queue-monitor.controller.ts # Dashboard API
│   └── queue.module.ts           # Queue module
└── config/
    ├── config.service.ts         # Updated with Redis config
    └── env/env.validation.ts     # Redis environment validation
```

## 🔧 Configuration

### Environment Variables
```env
# Redis Configuration
REDIS_ENABLED=false          # Set to true to enable Redis
REDIS_HOST=localhost         # Redis server host
REDIS_PORT=6379             # Redis server port
REDIS_PASSWORD=             # Redis password (optional)
REDIS_DB=0                  # Redis database number
REDIS_TTL=3600             # Default cache TTL in seconds
```

### Default Behavior
- **REDIS_ENABLED=false**: Uses in-memory job processing
- **REDIS_ENABLED=true**: Uses Redis + BullMQ for job processing

## 🎨 Job Types Supported

1. **Sketch Generation** (`sketch-generation`)
   - AI-powered sketch creation
   - Configurable quality levels
   - Processing time: 2-10 seconds

2. **Emotion Analysis** (`emotion-analysis`)
   - Text and image emotion analysis
   - Configurable analysis types
   - Processing time: 1.5-4 seconds

3. **Email Notifications** (`email-notification`)
   - Template-based emails
   - Priority levels
   - Processing time: 0.5-2 seconds

4. **Payment Processing** (`payment-processing`)
   - Capture, refund, verify operations
   - High priority by default
   - Processing time: 1-3 seconds

## 📊 Monitoring Dashboard

### API Endpoints
```
GET /queue/health              # Overall queue health
GET /queue/stats               # All queue statistics
GET /queue/stats/:type         # Specific queue stats
GET /queue/dashboard           # Complete dashboard data
DELETE /queue/clear/:type      # Clear queue (DANGER!)
```

### Test the System
```bash
# Test queue health
curl http://localhost:3001/queue/health

# Run test script
node test-queue-system.js
```

## 💻 Usage Examples

### Basic Job Creation
```typescript
// Inject the JobProducerService
constructor(private readonly jobProducer: JobProducerService) {}

// Create jobs easily
const jobId = await this.jobProducer.queueSketchGeneration({
  prompt: "A beautiful sunset over mountains",
  quality: "high",
  userId: "user123"
});

const emailJobId = await this.jobProducer.sendWelcomeEmail(
  "user@example.com",
  "John Doe",
  "user123"
);
```

### Advanced Job Creation
```typescript
// Using QueueService directly for custom options
const jobId = await this.queueService.addJob(
  JobType.SKETCH_GENERATION,
  {
    prompt: "Custom prompt",
    style: "realistic",
    userId: "user123"
  },
  {
    priority: JobPriority.HIGH,
    delay: 5000, // 5 second delay
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
);
```

## 🔄 Job Processing Flow

### With Redis (Production)
1. Job added to Redis queue via BullMQ
2. Worker picks up job based on priority
3. Processor handles the job
4. Result stored and job marked complete
5. Retry logic handles failures

### Without Redis (Development)
1. Job added to in-memory Map
2. Interval processor checks for jobs
3. Jobs processed by priority and creation time
4. Results logged and jobs cleaned up
5. Simple retry logic for failures

## 🚨 Error Handling

- **Redis Connection Failure**: Automatically falls back to in-memory
- **Job Processing Errors**: Retry with exponential backoff
- **Dead Letter Queues**: Failed jobs stored for debugging
- **Monitoring Alerts**: Health checks detect queue issues

## 🛠 Maintenance

### Redis Health Checks
```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis connection
redis-cli ping

# Monitor Redis
redis-cli monitor
```

### Queue Management
```bash
# Clear all queues (DANGER!)
curl -X DELETE http://localhost:3001/queue/clear/sketch-generation

# View queue stats
curl http://localhost:3001/queue/stats
```

## 🔮 Future Enhancements

When you need to scale further:

1. **Redis Cluster**: For high availability
2. **Queue Sharding**: Split queues across instances
3. **Custom Processors**: Add new job types easily
4. **Monitoring Integration**: Grafana, Prometheus
5. **Job Scheduling**: Cron-like delayed jobs

## 🎉 Benefits

### Current (In-Memory)
- ✅ Zero infrastructure dependencies
- ✅ Simple debugging
- ✅ Perfect for development
- ✅ Immediate availability

### With Redis (Production)
- ✅ Horizontal scaling
- ✅ Job persistence across restarts
- ✅ Advanced retry strategies
- ✅ Real-time monitoring
- ✅ Better concurrency control

## 🔧 Integration Points

The queue system integrates with:
- **Sketch Service**: AI sketch generation
- **Email Service**: User notifications
- **Payment Service**: Transaction processing
- **Analytics Service**: Emotion analysis

Each service can inject `JobProducerService` to queue background work easily.

---

**Ready to go!** The system works immediately in fallback mode and can be activated with Redis when needed. Perfect for MVP development with production scalability built-in. 