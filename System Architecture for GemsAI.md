# Updated System Architecture for GemsAI

Based on the user's detailed answers to the clarifying and architectural questions, this document provides an updated architecture plan for the GemsAI project.

## System Architecture Diagram (Updated)

```
+--------------------------------------------------+
|                                                  |
|                  CLIENT LAYER                    |
|                                                  |
|  +----------------+      +-------------------+   |
|  |                |      |                   |   |
|  |  Web Browser   |      |  Mobile Browser   |   |
|  |                |      |                   |   |
|  +-------+--------+      +---------+---------+   |
|          |                         |             |
+----------v-------------------------v-------------+
           |                         |
+----------v-------------------------v-------------+
|                                                  |
|                FRONTEND LAYER                    |
|                                                  |
|  +----------------+      +-------------------+   |
|  |                |      |                   |   |
|  |   Next.js      |<---->|   React Context   |   |
|  |  (App Router)  |      |   State Mgmt      |   |
|  |                |      |                   |   |
|  +-------+--------+      +---------+---------+   |
|          |                         |             |
|  +-------v--------+      +---------v---------+   |
|  |                |      |                   |   |
|  |  Tailwind CSS  |      |    framer-motion  |   |
|  |  shadcn/ui     |      |    Animations     |   |
|  | (RTL Support)  |      |                   |   |
|  +----------------+      +-------------------+   |
|          |                         |             |
|  +-------v--------+      +---------v---------+   |
|  |                |      |                   |   |
|  | next-i18next   |      |  WebRTC/Media     |   |
|  | Hebrew First   |      |  Recorder API     |   |
|  |                |      |                   |   |
|  +----------------+      +-------------------+   |
|                                                  |
+------------------+-------------------------------+
                   |
+------------------v-------------------------------+
|                                                  |
|                  API LAYER                       |
|                                                  |
|  +----------------+      +-------------------+   |
|  |                |      |                   |   |
|  |   Next.js API  |<---->|    NestJS API     |   |
|  |   Routes       |      |    Controllers    |   |
|  |                |      |                   |   |
|  +-------+--------+      +---------+---------+   |
|          |                         |             |
|  +-------v--------+      +---------v---------+   |
|  |                |      |                   |   |
|  | Rate Limiter   |      | JWT Auth          |   |
|  | Flexible       |      | Middleware        |   |
|  |                |      |                   |   |
|  +----------------+      +-------------------+   |
|                                                  |
+------------------+-------------------------------+
                   |
+------------------v-------------------------------+
|                                                  |
|                SERVICE LAYER                     |
|                                                  |
|  +----------------+      +-------------------+   |
|  |                |      |                   |   |
|  |  Story Service |      |  Sketch Service   |   |
|  |  Emotion       |      |  Generation       |   |
|  |  Detection     |      |  Queue            |   |
|  |                |      |                   |   |
|  +-------+--------+      +---------+---------+   |
|          |                         |             |
|  +-------v--------+      +---------v---------+   |
|  |                |      |                   |   |
|  |  Gift Service  |      |  Jeweler Service  |   |
|  |  Creation      |      |  Proposals        |   |
|  |  Sharing       |      |  Dashboard        |   |
|  |                |      |                   |   |
|  +-------+--------+      +---------+---------+   |
|          |                         |             |
|  +-------v--------+      +---------v---------+   |
|  |                |      |                   |   |
|  |  Payment       |      |  Admin Service    |   |
|  |  Service       |      |  Metrics          |   |
|  |                |      |  Monitoring       |   |
|  +----------------+      +-------------------+   |
|                                                  |
+------------------+-------------------------------+
                   |
+------------------v-------------------------------+
|                                                  |
|               EXTERNAL SERVICES                  |
|                                                  |
|  +----------------+      +-------------------+   |
|  |                |      |                   |   |
|  |    GPT-4o      |      |    ElevenLabs     |   |
|  |    OpenAI      |      |    TTS            |   |
|  |                |      |                   |   |
|  +----------------+      +-------------------+   |
|                                                  |
|  +----------------+      +-------------------+   |
|  |                |      |                   |   |
|  |    DALL·E      |      |    Stripe/PayPlus |   |
|  |    SDXL        |      |    Payments       |   |
|  |                |      |                   |   |
|  +----------------+      +-------------------+   |
|                                                  |
|  +----------------+      +-------------------+   |
|  |                |      |                   |   |
|  |    Posthog     |      |    Slack          |   |
|  |    Analytics   |      |    Webhooks       |   |
|  |                |      |                   |   |
|  +----------------+      +-------------------+   |
|                                                  |
+------------------+-------------------------------+
                   |
+------------------v-------------------------------+
|                                                  |
|               DATA LAYER                         |
|                                                  |
|  +----------------+      +-------------------+   |
|  |                |      |                   |   |
|  |   Supabase     |<---->|    AWS S3         |   |
|  |   Postgres     |      |    CloudFront CDN |   |
|  |                |      |                   |   |
|  +-------+--------+      +-------------------+   |
|          |                         |             |
|  +-------v--------+      +---------v---------+   |
|  |                |      |                   |   |
|  |   Redis        |      |    BullMQ         |   |
|  |   Cache/Queue  |      |    Workers        |   |
|  |   LRU+TTL      |      |                   |   |
|  +----------------+      +-------------------+   |
|                                                  |
+--------------------------------------------------+
```

## Key Architecture Decisions (Based on User Answers)

### 1. API Rate Limiting Strategy

- **Implementation**: rate-limiter-flexible in Node.js or NestJS guards
- **Approach**:
  - Per-user and global rate limiters at API Gateway level
  - Redis-based cache for emotion/tag results (TTL: 1-6 hours)
  - Limited retries on errors
- **Monitoring**: Posthog + custom metrics to track usage patterns

### 2. Sketch Generation Queue Scaling

- **Initial Capacity**: 100 concurrent users → ~30 sketches/hour
- **Implementation**:
  - 2-5 BullMQ workers horizontally scaled
  - NestJS workers in Kubernetes pods
  - Autoscaling based on Redis queue depth
- **Structure**: Initially part of NestJS monolith, later separate microservice

### 3. Mobile Voice Input Performance

- **Latency Target**: <1s for voice recording and transcription
- **Implementation**:
  - WebRTC or MediaRecorder API on client
  - Chunk-based processing with GPT-4o
  - Optimized for mobile bandwidth and buffering
- **Testing**: Lighthouse mobile audit across devices

### 4. Hebrew Language Support

- **Priority Areas**:
  - GPT-4o prompts/transcriptions
  - RTL UI layout with Tailwind (dir="rtl")
  - Emotion classification with Hebrew-specific vocabulary
  - Payment and notification messages
- **Implementation**: next-i18next or react-intl from the beginning
- **Future**: Structured for multilingual expansion

### 5. Jeweler Profile Customization

- **Phase 1 (MVP)**:
  - Basic profile (avatar, bio, location, categories, ratings)
  - Product listings with 3-5 images each
  - Response capability to sketches
- **Phase 2**:
  - Custom themes
  - Videos
  - Product showcases
- **Access Control**: Supabase role-based access and storage

### 6. AI Assistant to Sketch Generation Transition

- **UX Flow**:
  - Animated confirmation ("Your story is being sketched...")
  - Display emotion tags + estimated time with progress indicator
  - Background enqueue via BullMQ
  - Polling for sketch status
  - Redirect to sketch page when ready
- **Technical Implementation**: POST /sketch/start API from assistant endpoint

### 7. A/B Testing for Emotional Engagement

- **Priority Metrics**:
  - Story completion rate
  - Emotion match feedback ("Is this sketch what you felt?")
  - Sketch feedback scores
  - Share and reaction metrics on gift previews
- **Implementation**: Posthog with custom events tagged by user cohort and session

### 8. Emotion-to-Product Matching Algorithm

- **Approach**:
  - Mapping dictionary: {emotion_tag} → [style_1, style_2]
  - Product metadata tagging (style: "minimalist", "romantic", etc.)
  - Supabase SQL queries with WHERE emotion_style IN (...) logic
  - Fallback logic for no emotional matches (trending or jeweler-picked options)
- **Storage**: Postgres with GIN indexing for tag-based queries

### 9. Database Schema Design

- **Structure**:
  - Users Table
  - Stories Table with emotion_tags[] (array type)
  - Sketches Table with foreign key to story_id
  - Products Table with style_tags[]
  - Match Logs Table for product-sketch mappings
- **Optimization**: Postgres GIN indexing for tag-based queries

### 10. Authentication & Authorization

- **Implementation**: Supabase Auth
  - JWT-based access
  - Role-based auth: user, jeweler, admin
  - Middleware for role validation on protected endpoints

### 11. Media Storage & CDN

- **Storage**: AWS S3
- **Delivery**: CloudFront CDN for sketches, product images, gift videos
- **Optimization**: Image compression at upload using sharp in NestJS

### 12. Monitoring & Alerts

- **Tools**: Posthog + Slack Webhooks
- **Metrics to Monitor**:
  - Sketch queue time
  - Failed sketch generations
  - Payment failures
  - API latency
- **Alerting**: Threshold-based alerts (e.g., queue > 5 items for 2+ minutes → Slack alert)

### 13. API Design

- **MVP Approach**: REST API (sufficient for initial requirements)
- **Future Consideration**: GraphQL post-MVP for multi-view clients and performance tuning

### 14. Backup & Disaster Recovery

- **Database**: Daily backup of Supabase DB using built-in tools
- **Storage**: AWS S3 backup to a secondary region
- **Cache**: Redis persistence with RDB + AOF configuration
- **Configuration**: CI/CD backup of environment variables in GitHub Actions Secrets

### 15. CI/CD Pipeline

- **Platform**: GitHub Actions
- **Workflow**:
  - Lint, test, build (next build, nest build)
  - Auto-deploy on merge to main
  - Preview deployments on PRs
- **Deployment**: Vercel for frontend, Docker + ECS (or Fly.io) for backend services
