# GemsAI Project Context Mapping

## Technology Stack Mapping to Requirements

### Frontend Requirements

- **Next.js (App Router)**: Supports the complex routing needs for story flow, sketch viewing, gift creation, and jeweler tools
- **Tailwind CSS**: Enables responsive design for mobile-first approach and quick styling iterations
- **shadcn/ui + lucide**: Provides accessible UI components needed for emotional interfaces
- **React Hooks (Context)**: Manages state across the emotion-driven user flows
- **framer-motion**: Powers the gift wrap animations and transitions for emotional impact
- **react-hook-form**: Handles form validation for story input, jeweler uploads, and checkout
- **SWR/React Query**: Manages API data fetching with caching for sketch results and proposals

### Backend Requirements

- **Node.js using NestJS**: Provides structured backend architecture for handling complex emotion processing
- **Postgres via Supabase**: Stores user data, stories, sketches, and product information
- **AWS App Runner**: Hosts the backend services with scalability for sketch generation queue
- **Docker**: Enables consistent development environment and deployment
- **Posthog**: Tracks analytics for measuring emotional engagement and conversion metrics
- **Stripe**: Processes payments securely for jewelry purchases

### AI Service Requirements

- **GPT-4o**: Powers the voice assistant, story analysis, and emotion detection
- **ElevenLabs**: Provides high-quality TTS for the voice assistant with emotional tone
- **DALL·E/SDXL**: Generates sketch visualizations based on emotional stories

## MVP Features Mapped to Requirements

### 1. Emotion-Driven Story Capture

- **Requirements**: Voice input capability, real-time transcription, emotion detection, RTL support for Hebrew
- **Tech Implementation**:
  - Voice capture using browser APIs
  - GPT-4o for transcription and emotion analysis
  - React Context for storing story state
  - Tailwind for RTL layout support

### 2. AI Sketch Generation

- **Requirements**: Prompt construction from stories, reliable queue system, variant generation
- **Tech Implementation**:
  - NestJS backend for prompt processing
  - BullMQ with Redis for sketch queue
  - DALL·E/SDXL integration for image generation
  - S3 for sketch storage

### 3. Proposal Matching & Product Flow

- **Requirements**: Emotion-to-product matching, proposal preview, browsing by emotion
- **Tech Implementation**:
  - Postgres database with emotion tagging system
  - Next.js pages for proposal viewing
  - Supabase queries for emotion-based filtering

### 4. Gift Creation & Sharing

- **Requirements**: Voice/text message input, animation selection, shareable links
- **Tech Implementation**:
  - ElevenLabs for voice message processing
  - framer-motion for gift animations
  - Next.js API routes for share link generation

### 5. Jeweler Tools

- **Requirements**: Product upload, proposal submission, dashboard view
- **Tech Implementation**:
  - react-hook-form for upload forms
  - Supabase storage for media files
  - SWR for dashboard data fetching

### 6. Checkout & Payments

- **Requirements**: Secure checkout, payment processing, confirmation
- **Tech Implementation**:
  - Stripe integration for payment processing
  - NestJS webhooks for order status updates
  - Email notifications via AWS SES

### 7. Admin & Analytics

- **Requirements**: Metrics dashboard, alerts, logging, A/B testing
- **Tech Implementation**:
  - Posthog for analytics tracking
  - Slack webhooks for alerts
  - Supabase for log storage
  - Custom A/B test framework

## Future Features (Post-MVP) Mapped to Requirements

- **Real-time Collaboration**: Will require WebSocket implementation
- **Advanced Customization Tools**: Will need canvas-based drawing interface
- **Public Social Features**: Will require social graph database and sharing APIs
- **Full Multilingual Support**: Will need i18n framework implementation

## System Architecture Considerations

- **Scalability**: Sketch generation queue must handle concurrent requests
- **Reliability**: Payment and sketch systems need retry logic and monitoring
- **Security**: User data and payment information must be properly secured
- **Performance**: Sketch generation must complete within target time (≤ 2 minutes)
- **Localization**: Hebrew-first approach with RTL support throughout the application
- **Accessibility**: WCAG compliance for all user interfaces

## Development Approach Mapping

- **Mobile-First**: All UI components designed for mobile with responsive scaling
- **Emotion-Centric**: User flows organized around emotional storytelling
- **Iterative Testing**: A/B testing framework for optimizing emotional engagement
- **Jeweler Integration**: Tools designed for non-technical jeweler partners
