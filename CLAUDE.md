# GemsAI Codebase Architecture Guide

## Project Overview

GemsAI is an emotionally intelligent jewelry platform that transforms personal stories into AI-generated sketches and connects users with jewelers. The platform uses AI to analyze emotions in user stories and generate relevant jewelry designs, creating a meaningful connection between personal experiences and crafted jewelry.

## Core Technology Stack

### Frontend Architecture
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript 5+ with strict mode
- **UI Framework**: React 19 with React DOM 19
- **Styling**: Tailwind CSS 4 with RTL support via `tailwindcss-rtl`
- **Component Library**: Custom components built on Radix UI primitives
- **State Management**: React Context + React Hook Form for forms
- **Animation**: Framer Motion (implied from architecture docs)
- **Internationalization**: react-i18next with Hebrew-first approach

### Backend Architecture  
- **Framework**: NestJS 11+ with TypeScript
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Queue System**: BullMQ with Redis for background job processing
- **Storage**: AWS S3 + CloudFront CDN
- **Authentication**: Supabase Auth with JWT
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Winston with file and console transports

### AI & External Services
- **Language Model**: OpenAI GPT-4o for emotion analysis and conversation
- **Image Generation**: DALL-E/SDXL for sketch generation
- **Text-to-Speech**: ElevenLabs for voice messages
- **Payment Processing**: Stripe (global) + PayPlus (Israel)
- **Analytics**: PostHog for user analytics
- **Monitoring**: Slack webhooks for alerts

## Directory Structure

```
/GemsAI
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes (Next.js API)
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Protected dashboard pages
│   ├── story/                    # Story creation and viewing
│   └── [demo pages]/             # Development demo pages
├── components/                   # React components
│   ├── forms/                    # Form components with validation
│   ├── layout/                   # Layout components (Header, Footer, etc.)
│   ├── providers/                # Context providers
│   └── ui/                       # Reusable UI components
├── lib/                          # Utility libraries and services
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # Frontend service layer
│   ├── supabase/                 # Database client configurations
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── src/                          # NestJS backend source
│   ├── common/                   # Shared backend utilities
│   ├── config/                   # Configuration management
│   ├── [feature modules]/        # Domain-specific modules
│   ├── queue/                    # Background job processing
│   ├── redis/                    # Redis integration
│   └── storage/                  # File storage services
├── docs/                         # Documentation
├── public/locales/               # i18n translation files
└── scripts/                      # Development and deployment scripts
```

## Key Architectural Patterns

### 1. Dual Architecture (Next.js + NestJS)
- **Frontend**: Next.js handles UI, SSR, and client-side API calls
- **Backend**: NestJS provides robust API services, background processing, and integrations
- **Communication**: RESTful APIs between frontend and backend

### 2. Hebrew-First Internationalization
- Default language: Hebrew (he) with RTL layout support
- Fallback language: English (en)
- Translation system supports:
  - Static translations via JSON files in `/public/locales/`
  - Dynamic database translations via Supabase
  - Contextual translations for emotions, products, and content

### 3. Emotion-Driven Architecture
- **Emotion Analysis**: GPT-4o analyzes user stories for emotional content
- **Tag System**: Emotions mapped to jewelry style tags for product matching
- **Caching**: Emotion analysis results cached in Redis (TTL: 6 hours)

### 4. Queue-Based Processing
- **BullMQ** handles asynchronous tasks:
  - Sketch generation (DALL-E/SDXL)
  - Email notifications
  - Emotion analysis
  - Payment processing
- **Scaling**: 2-5 concurrent workers with auto-scaling based on queue depth

## Database Schema Architecture

### Core Business Tables
- **users**: User management with role-based access (user, jeweler, admin)
- **stories**: User emotional stories with AI analysis results
- **sketches**: AI-generated sketches linked to stories
- **jewelers**: Jeweler profiles and verification status
- **products**: Jewelry catalog with emotion/style tags
- **orders**: Order management with payment tracking
- **gifts**: Gift sharing system with tokenized URLs

### Internationalization Tables
- **languages**: Supported languages (he, en) with direction (RTL/LTR)
- **[entity]_translations**: Dedicated translation tables for each translatable entity
- **system_translations**: UI text translations
- **enum_translations**: Enum value translations

### Key Features
- **Row Level Security (RLS)**: Data isolation by user and role
- **GIN Indexes**: Optimized for tag-based queries (emotion_tags, style_tags)
- **Multilingual Views**: Automatic fallback to default language
- **Performance Indexes**: Strategic indexing for common query patterns

## Development Workflows

### Environment Setup
1. **Required Environment Variables**:
   ```bash
   # Core
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   OPENAI_API_KEY
   
   # Optional but recommended
   AWS_S3_BUCKET_NAME
   REDIS_URL
   STRIPE_SECRET_KEY
   ```

2. **Development Commands**:
   ```bash
   npm run dev                    # Start Next.js dev server
   npm run dev:memory            # Start with increased memory allocation
   npm run validate-env          # Check environment configuration
   npm run check-env             # Comprehensive environment validation
   ```

3. **Testing and Validation**:
   ```bash
   npm run test:all              # Run all task tests
   npm run lint                  # ESLint validation
   npm run type-check           # TypeScript compilation check
   npm run validate             # Run all validation steps
   ```

### Translation Management
```bash
npm run translations:validate    # Validate translation completeness
npm run translations:missing     # Find missing translations
npm run translations:stats       # Translation coverage statistics
npm run translations:scaffold    # Generate translation templates
```

### Build and Deployment
```bash
npm run build                    # Production build with env validation
npm run start                    # Production server
```

## Key Services and Utilities

### Frontend Services

#### Authentication (`lib/supabase/client.ts`)
- Supabase Auth integration with session management
- Role-based access control
- Demo mode fallback when Supabase unavailable
- Language context management for database sessions

#### Translation Hook (`lib/hooks/useTranslation.ts`)
- Enhanced i18next integration
- Locale-aware formatting (numbers, currency, dates)
- RTL layout utilities
- Translation key validation

#### Emotion Analysis (`lib/services/openai.ts`)
- GPT-4o integration for emotion detection
- Hebrew/English/Arabic language support
- Structured JSON response validation
- Fallback emotion detection using keyword matching

### Backend Services

#### Queue Processing (`src/queue/`)
- BullMQ integration with Redis
- Multiple job types: sketch generation, email, emotion analysis, payments
- Processor registration system
- Queue monitoring and health checks

#### Sketch Generation (`src/sketch/`)
- AI sketch generation pipeline
- Image storage on AWS S3
- Generation status tracking
- Cost tracking and user feedback collection

#### Configuration (`src/config/`)
- Environment validation with Joi schemas
- Type-safe configuration service
- Support for development, staging, and production environments

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Supabase handles token management
- **Role-based Access Control**: User, Jeweler, Admin roles
- **Route Protection**: Middleware validates authentication for protected routes
- **RLS Policies**: Database-level security for data isolation

### Data Protection
- **Environment Variables**: Sensitive data stored securely
- **API Rate Limiting**: `rate-limiter-flexible` prevents abuse
- **Input Validation**: Class-validator and Zod for request validation
- **CORS Configuration**: Controlled cross-origin access

## Performance Optimizations

### Caching Strategy
- **Redis**: Emotion analysis results, user preferences, translation data
- **CDN**: AWS CloudFront for images and static assets
- **Database Indexes**: GIN indexes for array-based queries

### Memory Management
- **Webpack Configuration**: Development memory optimization
- **Image Processing**: Sharp for server-side image optimization
- **Bundle Optimization**: Code splitting and lazy loading

## Demo and Development Features

### Demo Pages (Available without full setup)
- `/voice-demo` - Voice recording functionality
- `/text-input-demo` - Text input components
- `/transcription-demo` - Speech-to-text demonstration
- `/story-submission-demo` - Complete story submission flow
- `/database-demo` - Database connectivity testing
- `/formatting-demo` - Internationalization formatting
- `/rtl-demo` - RTL layout demonstration
- `/auth-test` - Authentication flow testing

### Development Tools
- **Environment Info Component**: Shows current environment status
- **Validation Scripts**: Comprehensive environment and setup validation
- **Translation CLI**: Tools for managing multilingual content
- **Task Testing**: Automated testing for development milestones

## Integration Points

### External APIs
- **OpenAI GPT-4o**: Story analysis and emotion detection
- **DALL-E/SDXL**: AI image generation for sketches
- **ElevenLabs**: Text-to-speech for voice messages
- **Stripe/PayPlus**: Payment processing
- **AWS S3**: File storage and CDN delivery
- **PostHog**: User analytics and behavior tracking

### Webhook Integrations
- **Payment Webhooks**: Order status updates from payment providers
- **Slack Notifications**: System alerts and monitoring
- **Real-time Updates**: Supabase real-time subscriptions for live data

## Deployment Architecture

### Frontend Deployment
- **Platform**: Vercel (recommended) with automatic deployments
- **Environment**: Multiple environments (development, staging, production)
- **CDN**: Automatic edge caching and global distribution

### Backend Deployment
- **Containerization**: Docker support for NestJS services
- **Platforms**: AWS ECS, Fly.io, or similar container platforms
- **Scaling**: Horizontal scaling for queue workers and API services

### Database
- **Supabase**: Managed PostgreSQL with automatic backups
- **Migrations**: SQL migration files in `/docs/supabase/`
- **Monitoring**: Built-in performance monitoring and alerts

## Future Considerations

### Scaling Triggers
- **100K+ users**: Consider read replicas for database
- **1M+ products**: Implement dedicated search service (Elasticsearch)
- **10M+ orders**: Consider microservices architecture

### Enhancement Opportunities
- **AI Model Versioning**: Track and manage different AI model versions
- **Advanced Recommendation Engine**: ML-based product recommendations
- **Real-time Collaboration**: Multi-user sketch collaboration features
- **Mobile App**: React Native or native mobile applications

## Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled with comprehensive type definitions
- **ESLint/Prettier**: Automated code formatting and linting
- **Conventional Commits**: Structured commit messages for changelog generation
- **Husky**: Pre-commit hooks for code quality enforcement

### Testing Strategy
- **Unit Tests**: Component and service-level testing
- **Integration Tests**: API endpoint and database testing
- **E2E Tests**: Full user journey testing (Playwright recommended)
- **Performance Tests**: Load testing for critical paths

### Documentation
- **Code Comments**: Comprehensive JSDoc comments for public APIs
- **Architecture Decision Records**: Document significant architectural choices
- **API Documentation**: Swagger/OpenAPI documentation for all endpoints
- **User Documentation**: Comprehensive setup and usage guides

This codebase represents a sophisticated, production-ready application with comprehensive internationalization, AI integration, and scalable architecture designed for the Israeli market with global expansion potential.