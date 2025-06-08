# Updated GemsAI Implementation Plan for Cursor

Based on the user's detailed answers to the clarifying and architectural questions, this document provides an updated implementation plan for the GemsAI project.

## Project Setup and Environment Configuration

### 1. Initialize Project Structure

- Create a new Next.js project with App Router
- Set up Tailwind CSS with RTL support and shadcn/ui components
- Configure next-i18next for Hebrew-first approach with English fallback
- Initialize Docker for local development
- Set up ESLint and Prettier for code quality

### 2. Configure Backend Services

- Set up NestJS backend structure with modular services
- Configure Supabase connection with appropriate schema design:
  - Users Table
  - Stories Table with emotion_tags[] (array type)
  - Sketches Table with foreign key to story_id
  - Products Table with style_tags[]
  - Match Logs Table for product-sketch mappings
- Set up AWS services (S3 with CloudFront CDN)
- Initialize Docker Compose for local development
- Configure environment variables and secrets management via AWS Parameter Store

### 3. Establish CI/CD Pipeline

- Set up GitHub Actions for testing and deployment:
  - Lint, test, build (next build, nest build)
  - Auto-deploy on merge to main
  - Preview deployments on PRs
- Configure Vercel for frontend deployment
- Set up Docker + ECS (or Fly.io) for backend services
- Implement staging and production environments
- Configure environment variable backups in GitHub Actions Secrets

## Core Feature Implementation (MVP)

### 4. Emotion-Driven Story Capture

- Implement voice input component with WebRTC or MediaRecorder API
- Optimize for <1s latency on mobile devices
- Create text input alternative with RTL support
- Develop emotion detection service using GPT-4o with Hebrew language support
- Implement rate limiting using rate-limiter-flexible
- Build persona-guided assistant flow with conversation states
- Implement story preview and confirmation screens
- Add Redis caching for emotion/tag results with TTL (1-6 hours)

### 5. AI Sketch Generation

- Develop prompt construction service from story and emotion tags
- Implement sketch generation queue with BullMQ and Redis:
  - Configure 2-5 workers for horizontal scaling
  - Set up for initial capacity of ~30 sketches/hour
  - Implement autoscaling based on queue depth
- Create sketch viewer UI with emotion tag display
- Build variant generation and selection interface
- Implement admin monitoring dashboard for sketch queue
- Add animated transition from assistant to sketch generation:
  - Show progress indicator with estimated time
  - Implement background polling for sketch status

### 6. Proposal Matching & Product Flow

- Develop product match engine based on emotion tags:
  - Create mapping dictionary: {emotion_tag} → [style_1, style_2]
  - Implement product metadata tagging system
  - Build Supabase SQL queries with WHERE emotion_style IN (...) logic
  - Add fallback logic for no emotional matches
- Create proposal preview interface with rationale display
- Implement emotion-tagged browsing with filters
- Build feedback mechanism for sketch quality
- Create jeweler discovery and profile viewing
- Implement GIN indexing for tag-based queries

### 7. Gift Creation & Sharing

- Implement gift message input with voice and text options
- Develop gift wrap animation selection interface (5+ themes)
- Create gift preview and share link generation
- Build gift viewer with reaction capabilities
- Implement analytics for gift sharing and reactions:
  - Track share rates
  - Measure reaction engagement
  - Collect emotional feedback

### 8. Jeweler Tools

- Create product upload form with media handling:
  - Support for 3-5 images per product
  - Image compression using sharp in NestJS
- Implement basic profile features (avatar, bio, location, categories, ratings)
- Build jeweler dashboard with analytics
- Develop sketch rework feedback mechanism
- Implement notification system for new sketch requests
- Configure Supabase role-based access control

### 9. Checkout & Payments

- Implement secure checkout UI with form validation
- Set up Stripe integration for payment processing
- Add PayPlus integration for Israeli market
- Create payment webhook handlers for order status updates
- Implement purchase confirmation and receipts
- Build failure recovery mechanisms for payment issues
- Add Hebrew language support for payment and notification messages

### 10. Admin & Analytics

- Develop metrics dashboard with key performance indicators:
  - Story completion rate
  - Emotion match feedback
  - Sketch feedback scores
  - Share and reaction metrics
- Implement Slack alerts for system issues:
  - Sketch queue time alerts (queue > 5 items for 2+ minutes)
  - Failed sketch generations
  - Payment failures
  - API latency issues
- Create log viewer with search and filtering
- Build A/B test tracking system using Posthog with custom events
- Implement user behavior analytics with cohort and session tagging

## Testing and Quality Assurance

### 11. Implement Testing Framework

- Set up Jest for unit testing
- Configure React Testing Library for component testing
- Implement Playwright for end-to-end testing
- Create test scenarios for critical user flows
- Set up test coverage reporting
- Add Lighthouse mobile audits for voice input performance

### 12. Perform Accessibility and Localization Testing

- Test RTL layout and Hebrew language support
- Verify WCAG compliance for all interfaces
- Test screen reader compatibility
- Validate mobile responsiveness
- Ensure keyboard navigation works properly
- Test Hebrew-specific emotional vocabulary in emotion classification

## Performance Optimization

### 13. Optimize Frontend Performance

- Implement code splitting and lazy loading
- Optimize image loading with CloudFront CDN
- Set up performance monitoring
- Implement Redis caching strategies:
  - LRU eviction with TTL
  - Cache emotion tag results
  - Cache product listings by emotion/style
  - Cache sketch generation statuses
- Optimize bundle size

### 14. Optimize Backend Performance

- Implement database query optimization with GIN indexing
- Set up Redis caching for frequent operations
- Configure horizontal scaling for sketch worker
- Implement rate limiting and throttling
- Set up performance monitoring and alerting
- Optimize for mobile bandwidth and buffering

## Deployment and Launch Preparation

### 15. Prepare for Production Deployment

- Finalize environment configurations
- Set up monitoring and logging:
  - Sketch queue time
  - Failed sketch generations
  - Payment failures
  - API latency
- Implement backup strategies:
  - Daily backup of Supabase DB
  - AWS S3 backup to secondary region
  - Redis persistence with RDB + AOF
- Configure CloudFront CDN for static assets
- Set up error tracking and reporting

### 16. Create Documentation

- Document API endpoints and usage
- Create developer onboarding guide
- Document deployment procedures
- Create user guides for jewelers and admins
- Document system architecture and data flow
- Add documentation for Hebrew language support and RTL considerations

## Future Features (Post-MVP)

### 17. Plan for Future Enhancements

- Design real-time collaboration features
- Plan advanced customization tools for jeweler profiles:
  - Custom themes
  - Videos
  - Product showcases
- Design public social features
- Prepare for multilingual support expansion beyond Hebrew
- Research AI model fine-tuning opportunities
- Plan for potential microservice architecture for sketch generation
- Evaluate GraphQL implementation for multi-view clients
