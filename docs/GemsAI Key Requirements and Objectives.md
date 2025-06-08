# GemsAI Key Requirements and Objectives

## Core Purpose (WHAT)

GemsAI is an emotionally intelligent jewelry platform that connects emotion, personal storytelling, and technology. It enables users to purchase personalized jewelry through a voice-based AI assistant or free browsing. The platform transforms user stories into AI-generated sketches, which are then matched with jewelry products or used to create custom pieces.

## Target Audience (WHO)

### End Users (Buyers/Creators)

- **The Romantic Giver** – Emotional gift-giver focused on meaningful milestones
- **The Self-Expressive Buyer** – Interested in jewelry as self-expression
- **The Gift Explorer** – Uncertain shoppers needing emotional guidance

### Jeweler Partners (Supply Side)

- **The Boutique Artisan** – Seeks exposure with no tech friction
- **The Custom Commission Expert** – Loves interpreting emotional briefs
- **The Trend-Conscious Designer** – Attracted by storytelling differentiation

## Pain Points Solved (WHY)

- People seeking personalized, emotionally resonant gifts struggle to find meaningful jewelry that truly reflects their stories or sentiments
- Traditional jewelry shopping lacks emotional context and personalization
- Jewelers lack a seamless way to tap into the emotional storytelling market
- Gift-giving often lacks the emotional impact and personalization that makes it truly special

## Differentiators (HOW)

- **AI-Powered Emotional Intelligence** – Voice/text story analysis and emotion detection
- **Story-to-Sketch Transformation** – AI generates visual representations of emotional stories
- **Personalized Jewelry Matching** – Emotion-based product recommendations
- **Digital Gifting Experience** – Shareable unboxing with personal messages
- **Hebrew-First UX** – RTL layout, gendered-language sensitivity, localized voice AI

## Technology Stack

### Frontend

- **Framework**: Next.js (App Router) with SSR and modular routing
- **Styling**: Tailwind CSS (responsive, utility-first)
- **UI Components**: shadcn/ui + lucide (accessible, flexible)
- **Forms**: react-hook-form (lightweight, TypeScript-friendly)
- **State Management**: React Hooks (Context) with potential upgrade to Zustand
- **Animation**: framer-motion for gift wrap and transitions
- **Data Fetching**: SWR or React Query via sdk/ directory

### Backend

- **API**: Modular REST + Supabase
- **Hosting/Deploy**: Vercel (Frontend), AWS ECS (Backend)
- **DB & Storage**: Supabase, S3, TimescaleDB for trends
- **Secrets**: AWS Parameter Store

### AI Services

- **GPT-4o** (OpenAI) for story processing, emotion detection, and assistant conversation
- **ElevenLabs** for Text-to-Speech (TTS) with emotional Hebrew voice output
- **DALL·E / SDXL** for sketch generation

### Payment Processing

- **PayPlus** (local Israeli payment processor)
- **Stripe** integration

## MVP Features

### 1. Emotion-Driven Story Capture

- **Voice/Text Story Entry** – Toggle input types, real-time transcription, RTL support
- **Emotion Detection & Tagging** – Analyze story for emotional tones, editable tags
- **Persona-Guided Assistant Flow** – Warm, guided assistant with persona templates
- **Story Preview & Confirmation** – Full preview, edit options, confirm gate

### 2. AI Sketch Generation

- **Prompt Construction** – Transform story + tags into visual prompt
- **Sketch API Worker** – Queue sketch tasks reliably with retries
- **Sketch Viewer UI** – View sketch and emotional context
- **Sketch Variants** – Multiple sketch styles (3-5 unique variants)
- **Admin Monitoring** – Monitor queue health and outcomes

### 3. Proposal Matching & Product Flow

- **Product Match Engine** – Match sketches to emotionally relevant jewelry
- **Proposal Preview** – Preview proposals generated from sketch
- **Emotion-Tagged Browsing** – Browse jewelry by emotional themes
- **Feedback on Sketch** – Rate and comment on sketch

### 4. Gift Creation & Sharing

- **Gift Message Input** – Record or write gift message
- **Gift Wrap Animation** – Choose and preview gift animation themes
- **Gift Preview & Share Link** – Preview and generate shareable link
- **Gift Viewer & Reactions** – View and react to gift

### 5. Jeweler Tools

- **Upload Form** – Upload products with tags/media
- **Submit Proposals** – Respond to sketches with proposals
- **Dashboard View** – Track proposals and uploads
- **Sketch Rework Feedback** – Request revisions on sketches

### 6. Checkout & Payments

- **Checkout UI** – Securely complete purchase
- **Payment Webhook** – Update order status from payment processor
- **Purchase Confirmation** – Receipt and confirmation
- **Failure Recovery** – Retry failed payments easily

### 7. Admin & Analytics

- **Metrics Dashboard** – View key usage stats
- **Slack Alerts** – Alert failures via Slack
- **Log Viewer** – Search logs by session or endpoint
- **A/B Test Tracker** – Compare prompt and flow performance

## Future Features (Post-MVP)

- Real-time collaboration with jewelers
- Advanced customization tools or drawing
- Public social features
- Full multilingual support (planned post-launch)

## Technical Constraints & Dependencies

- Hebrew/RTL support required (with fallback to English)
- Emotion mapping critical to flow logic
- Mobile-first, fully accessible design
- Sketch system must be fault-tolerant and scalable
- Real-time audio must be low-latency and reliable

## Success Metrics & KPIs

| Area         | Metric                        | Target      |
| ------------ | ----------------------------- | ----------- |
| Engagement   | Story flow completion rate    | ≥ 60%       |
|              | Time to sketch delivery       | ≤ 2 minutes |
|              | Gift creation rate            | ≥ 30%       |
| Conversion   | Proposal click-through        | ≥ 25%       |
|              | Jeweler profile views/session | ≥ 3         |
| Satisfaction | Avg. sketch rating (1–5)      | ≥ 4.0       |
|              | Gift reactions (shared links) | ≥ 40%       |
| Jeweler Use  | Product uploads/month/jeweler | ≥ 2         |
|              | Proposal acceptance rate      | ≥ 50%       |
| Reliability  | Sketch success rate           | ≥ 95%       |
|              | System uptime                 | ≥ 99.9%     |

## Known Risks & Mitigations

| Risk                              | Mitigation Strategy                       |
| --------------------------------- | ----------------------------------------- |
| API downtime (GPT-4o, ElevenLabs) | Circuit breakers, retries, fallbacks      |
| Misaligned emotion matches        | Manual review and feedback loop           |
| Sketch generation scaling         | Retry logic, BullMQ, admin tools          |
| Gift link abuse                   | Rate limits, tokenized access, moderation |
| Payment or webhook failures       | Fallback flows, logs, alerting            |
| Accessibility issues              | Manual QA and WCAG compliance             |
