## Launch Features (MVP)

### Emotion-Driven Story Capture

**A voice and text-based system that captures user stories, analyzes emotional content, and guides users through a persona-based conversation flow to create meaningful jewelry experiences.**

- Voice/text toggle input with real-time transcription and RTL support
- Emotion detection and tagging (1-3 dominant emotions)
- Persona-guided assistant with "Yes And" conversation model
- Story preview and confirmation with edit capabilities

#### Tech Involved

- GPT-4o for transcription and emotion analysis
- ElevenLabs for voice output
- React Context for state management
- Next.js App Router for flow navigation

#### Main Requirements

- Hebrew/RTL support required
- Mobile-first, accessible design
- Real-time audio processing
- Emotion tag editing capabilities

### AI Sketch Generation

**A robust system that transforms emotional stories into visual sketches, providing multiple artistic variants and reliable processing through a scalable queue architecture.**

- Prompt construction from story and emotion tags
- Sketch API worker with queue and retry logic
- Sketch viewer with emotion context display
- Multiple sketch variants (3-5 styles)
- Admin monitoring dashboard

#### Tech Involved

- DALL·E/SDXL for image generation
- BullMQ with Redis for queue management
- AWS S3 for sketch storage
- NestJS for backend processing

#### Main Requirements

- 95% sketch success rate
- Generation time under 2 minutes
- Fault-tolerant with retry logic
- Horizontal scaling capability

### Proposal Matching & Product Flow

**An intelligent matching system that connects emotional sketches to relevant jewelry products, enabling emotion-based browsing and feedback collection.**

- Product match engine based on emotion tags
- Proposal preview with rationale display
- Emotion-tagged browsing and filtering
- Sketch feedback and rating system
- Jeweler discovery and profile viewing

#### Tech Involved

- Supabase for database and queries
- Emotion-to-style mapping algorithm
- React components for proposal display
- Rating and feedback collection system

#### Main Requirements

- At least 3 product proposals per sketch
- Emotional relevance ranking
- Tag-based filtering system
- Feedback analytics for improvement

### Gift Creation & Sharing

**A comprehensive digital gifting system that allows users to create, preview, and share personalized gift experiences with voice messages and animations.**

- Gift message recording (voice/text)
- Gift wrap animation selection (5+ themes)
- Gift preview and share link generation
- Gift viewer with reaction capabilities

#### Tech Involved

- framer-motion for animations
- ElevenLabs for voice message processing
- Next.js API routes for share links
- Reaction collection system

#### Main Requirements

- Voice compression and optimization
- Responsive animation rendering
- Unique share link generation
- Reaction tracking and analytics

### Jeweler Tools

**A suite of tools for jewelry artisans to upload products, respond to sketches with proposals, track performance, and provide feedback.**

- Product upload form with media handling
- Proposal submission workflow
- Dashboard with analytics
- Sketch rework feedback mechanism

#### Tech Involved

- react-hook-form for form handling
- Supabase storage for media files
- Analytics dashboard components
- Notification system

#### Main Requirements

- Tag auto-suggestion from emotion terms
- Draft saving capability
- Performance metrics tracking
- Revision history for traceability

### Checkout & Payments

**A secure, reliable payment system with comprehensive error handling and confirmation processes.**

- Checkout UI with form validation
- Payment processing integration
- Order status webhooks
- Purchase confirmation and receipts
- Failure recovery mechanisms

#### Tech Involved

- Stripe for payment processing
- PayPlus integration for Israeli market
- Webhook handlers for status updates
- Email notification system

#### Main Requirements

- Support for multiple payment methods
- Secure tokenization
- Comprehensive error handling
- Clear confirmation process

### Admin & Analytics

**A powerful suite of tools for monitoring system performance, tracking metrics, receiving alerts, and optimizing user flows.**

- Metrics dashboard with KPIs
- Slack alerts for system issues
- Log viewer with search and filtering
- A/B test tracking system

#### Tech Involved

- Posthog for analytics
- Slack webhooks for alerts
- Supabase for log storage
- Custom A/B test framework

#### Main Requirements

- Real-time and historical metrics
- Configurable alert thresholds
- Searchable logs with retention
- Statistical confidence in A/B results

## Future Features (Post-MVP)

### Real-time Collaboration

- Live co-design sessions between users and jewelers
- Shared canvas for design modifications
- Real-time chat during collaboration
- Design version history

#### Tech Involved

- WebSocket implementation
- Collaborative editing framework
- Real-time presence indicators
- Version control system

#### Main Requirements

- Low-latency synchronization
- Conflict resolution
- Session persistence
- Mobile compatibility

### Advanced Customization Tools

- Interactive jewelry design tools
- 3D visualization and manipulation
- Material and gemstone selection
- Custom engraving options

#### Tech Involved

- WebGL/Three.js for 3D rendering
- Canvas-based drawing interface
- Material simulation algorithms
- Custom font rendering

#### Main Requirements

- Realistic rendering
- Intuitive mobile controls
- Design export capabilities
- Performance optimization

### Public Social Features

- User profiles and collections
- Social sharing of designs
- Community voting and trending
- Inspiration galleries

#### Tech Involved

- Social graph database
- Content moderation system
- Recommendation engine
- Social sharing APIs

#### Main Requirements

- Privacy controls
- Content moderation
- Performance at scale
- Engagement metrics

### Multilingual Support

- Full internationalization beyond Hebrew
- Language-specific emotion detection
- Localized payment methods
- Cultural style preferences

#### Tech Involved

- i18n framework implementation
- Language-specific AI models
- Localized payment gateways
- Cultural style mapping

#### Main Requirements

- Seamless language switching
- RTL/LTR handling
- Cultural sensitivity
- Regional payment methods

## System Diagram

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
+----------v-------------------------v-------------+
           |                         |
+----------v-------------------------v-------------+
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
+------------------+-------------------------------+
                   |
+------------------v-------------------------------+
|                                                  |
|               DATA LAYER                         |
|                                                  |
|  +----------------+      +-------------------+   |
|  |                |      |                   |   |
|  |   Supabase     |<---->|    AWS S3         |   |
|  |   Postgres     |      |    Storage        |   |
|  |                |      |                   |   |
|  +----------------+      +-------------------+   |
|                                                  |
|  +----------------+      +-------------------+   |
|  |                |      |                   |   |
|  |   Redis        |      |    TimescaleDB    |   |
|  |   Cache/Queue  |      |    Analytics      |   |
|  |                |      |                   |   |
|  +----------------+      +-------------------+   |
|                                                  |
+--------------------------------------------------+
```

## Questions & Clarifications

- How should we handle rate limiting for the GPT-4o and ElevenLabs APIs to manage costs while maintaining performance?
- What is the expected volume of concurrent users during peak times to properly size the sketch generation queue?
- Are there specific performance requirements for the voice input and transcription features on mobile devices?
- How should we prioritize Hebrew language support across different components of the application?
- What level of customization should jewelers have for their profile pages and product listings?
- How should we handle the transition between the AI assistant conversation and the sketch generation process?
- What metrics should be prioritized for the A/B testing framework to optimize emotional engagement?
- How should we implement the emotion-to-product matching algorithm to ensure relevant proposals?

## List of Architecture Consideration Questions

- Should we implement a microservices architecture for better scaling of the sketch generation service?
- What caching strategy should we implement for frequently accessed data like product listings and emotion tags?
- How should we structure the database schema to efficiently support emotion-based queries and product matching?
- What authentication and authorization strategy should we implement for users, jewelers, and admins?
- How should we handle media storage and CDN configuration for optimal performance?
- What monitoring and alerting strategy should we implement for critical services like sketch generation and payments?
- Should we implement GraphQL for more efficient data fetching on the frontend?
- How should we handle internationalization and localization beyond Hebrew support?
- What backup and disaster recovery strategy should we implement for user data and generated content?
- How should we structure the CI/CD pipeline to support frequent iterations and feature testing?
