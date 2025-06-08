## Project Bootstrap & Foundation Setup

### Step 1: Initialize Repositories and Project Structure

#### Detailed technical explanation of what we’re accomplishing in this step

We will scaffold the frontend and backend repositories, set up essential tooling, configure the environment, and confirm base connectivity (frontend ↔ backend ↔ DB).

#### Task Breakdown

##### Create Frontend Project (Next.js + Tailwind)

- Scaffold a Next.js App Router project with TypeScript
- /frontend
- Create

##### Configure Tailwind, RTL, i18n (Hebrew-first)

- Add TailwindCSS with RTL support and next-i18next for Hebrew
- /frontend/tailwind.config.js, /frontend/i18n/
- Create/Update

##### Scaffold Backend Project (NestJS)

- Scaffold backend monorepo using NestJS CLI
- /backend
- Create

##### Add Supabase & Redis clients

- Initialize clients and test DB connection with mock tables
- /backend/src/lib/supabase.ts, /backend/src/lib/redis.ts
- Create

#### Other Notes On Step 1

- User must configure Supabase keys and Redis credentials in `.env` before running dev servers.
- CI/CD will be added in Step 2.

---

### Step 2: CI/CD + Linting + Docker Setup

#### Detailed technical explanation

Implement consistent formatting, linting, test pipeline, and containerize environments for dev and production.

#### Task Breakdown

##### Set up ESLint and Prettier in both repos

- Configure formatting and linting
- /.eslintrc.js, /.prettierrc
- Create

##### Add GitHub Actions workflows

- Add build/test/lint workflows with preview deployment
- /.github/workflows/main.yml
- Create

##### Create Dockerfile and Docker Compose

- Build dev/prod images for frontend and backend
- /Dockerfile, /docker-compose.yml
- Create

#### Other Notes On Step 2

- Ensure Supabase/Redis/Stripe API keys are added to GitHub Secrets for CI.
- Confirm local dev with `docker-compose up`.

---

## Emotion-Driven Story Capture Implementation

### Step 3: Voice/Text Input & Assistant Flow

#### Explanation

Capture user input via voice or text, transcribe and detect emotion tags using GPT-4o.

#### Task Breakdown

##### Voice/Text Toggle UI

- Create story entry UI with real-time transcription
- /frontend/components/assistant/StoryCapture.tsx
- Create

##### Persona-Based Assistant UI

- Build Yes-And assistant with chat flow
- /frontend/components/assistant/AssistantFlow\.tsx
- Create

##### Emotion Detection API

- Send story to backend -> GPT-4o -> return emotion tags
- /backend/src/modules/emotion/emotion.controller.ts
- Create

##### Redis Emotion Cache

- Cache results of emotion classification
- /backend/src/services/emotion.service.ts
- Create

#### Other Notes

- ElevenLabs integration added later for voice playback.
- Blocked by GPT-4o API key setup.

---

### Step 4: Story Submission + Preview

#### Explanation

Allow user to preview/edit their story before submitting it to be sketched.

#### Task Breakdown

##### Story Preview UI

- Review and confirm story + tags
- /frontend/components/assistant/StoryPreview\.tsx
- Create

##### Save Story API

- Create story record with tags
- /backend/src/modules/stories/stories.controller.ts
- Create

##### Supabase Table: `stories`

- Store user_id, emotion_tags\[], story_text
- Supabase DB
- Create

---

## AI Sketch Generation Implementation

### Step 5: Sketch Job Queue & Generation

#### Explanation

Use BullMQ to queue sketch jobs and call SDXL or DALL·E to generate art.

#### Task Breakdown

##### Create Sketch API Entry Point

- Accept POST from frontend, enqueue job
- /backend/src/modules/sketches/sketch.controller.ts
- Create

##### Sketch Processor Worker

- Process jobs, call sketch API, upload to S3
- /backend/jobs/sketchProcessor.worker.ts
- Create

##### Sketch Polling UI

- Frontend polls status while sketch is generating
- /frontend/components/sketch/SketchLoading.tsx
- Create

##### Supabase Table: `sketches`

- Store sketch metadata, S3 URL, status
- Supabase
- Create

#### Other Notes

- Blocked by access to sketch API (DALL·E/SDXL credentials)

---

### Step 6: Sketch Viewer + Emotion Context

#### Explanation

Users view the sketch, emotional context, and proceed to product recommendations.

#### Task Breakdown

##### Sketch Viewer Component

- Show image, tags, and next call-to-action
- /frontend/components/sketch/SketchViewer.tsx
- Create

##### Sketch Retrieval Endpoint

- Return sketch metadata from DB
- /backend/src/modules/sketches/sketch.controller.ts
- Update

---

## Proposal Matching & Product Flow

### Step 7: Emotion-to-Product Matching Engine

#### Explanation

Use emotion tags to filter products via style_tags\[] using Postgres GIN indexing.

#### Task Breakdown

##### Product Match Engine

- Map emotion → style, fetch matches
- /backend/src/modules/products/product.service.ts
- Create

##### Supabase Tables: `products`, `match_logs`

- Store jewelry listings and match logs
- Supabase
- Create

##### Product Grid UI + Proposal View

- Filtered by tags, preview jewelry, click-through
- /frontend/components/product/ProductGrid.tsx
- Create

---

## Gift Creation & Sharing

### Step 8: Gift Creation Flow

#### Explanation

Allow user to personalize a gift with voice/text message and wrap style.

#### Task Breakdown

##### Gift Input UI

- Record or write message, choose wrap
- /frontend/components/gift/GiftEditor.tsx
- Create

##### Create Gift API

- Generate share token, save to DB
- /backend/src/modules/gifts/gifts.controller.ts
- Create

##### Supabase Table: `gifts`

- Track messages, tokens, reactions
- Supabase
- Create

##### Gift Preview & Share Page

- Preview final gift, get shareable link
- /frontend/app/gift/\[token]/page.tsx
- Create

---

## Jeweler Tools Implementation

### Step 9: Jeweler Dashboard + Product Upload

#### Explanation

Jeweler can upload items, edit their profile, and respond to sketches.

#### Task Breakdown

##### Profile Editor + Product Upload UI

- Jeweler form for media + tags
- /frontend/components/jeweler/ProductForm.tsx
- Create

##### Jeweler APIs

- Save product, return dashboard metrics
- /backend/src/modules/jewelers/
- Create

##### Supabase Tables: `jewelers`, `products`

- Profile, categories, uploads
- Supabase
- Create

---

## Checkout & Payments

### Step 10: Checkout Flow + Stripe/PayPlus Integration

#### Explanation

Enable secure checkout using Stripe (global) and PayPlus (IL).

#### Task Breakdown

##### Checkout Form UI

- Collect payment details securely
- /frontend/components/checkout/CheckoutForm.tsx
- Create

##### Payment API & Webhooks

- Trigger payment, listen for result
- /backend/src/modules/checkout/checkout.controller.ts
- Create

##### Supabase Table: `orders`

- Track payment status, receipt URL
- Supabase
- Create

---

## Admin & Analytics

### Step 11: Admin Metrics + Slack Alerts

#### Explanation

Allow internal team to track performance, sketch failures, and trigger alerts.

#### Task Breakdown

##### Admin Dashboard UI

- View metrics and logs
- /frontend/components/admin/AdminDashboard.tsx
- Create

##### Analytics APIs

- Fetch KPIs, log summaries, and A/B test data
- /backend/src/modules/admin/analytics.controller.ts
- Create

##### Slack Alert System

- Trigger Slack alerts on sketch fail, payment fail
- /backend/src/services/alerts/slack.service.ts
- Create

---

### Step 12: Final QA, Accessibility, and Mobile Testing

#### Explanation

Ensure mobile-first design, Hebrew RTL layout, accessibility and UX consistency across flows.

#### Task Breakdown

##### WCAG & Voice Audit

- Run Lighthouse audits and screen reader tests
- Entire frontend
- Validate

##### Mobile Device Testing

- Responsive UI tests across multiple screen sizes
- Entire frontend
- Validate

##### Posthog + A/B Configuration

- Track engagement across assistant/sketch flows
- backend + frontend sdk/lib
- Update/Create

---

✅ This plan takes you from an empty repo to fully functioning MVP, in the correct dependency order.
Would you like it exported into GitHub issues, Trello tickets, or Notion format next?
