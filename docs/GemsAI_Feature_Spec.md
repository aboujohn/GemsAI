## File System

### Frontend Repository

```
/frontend
├── app/
│   ├── layout.tsx
│   ├── page.tsx (home)
│   └── [routes]/
│       ├── story/
│       ├── sketch/
│       ├── product/
│       ├── gift/
│       └── checkout/
├── components/
│   ├── ui/
│   ├── assistant/
│   ├── sketch/
│   ├── gift/
│   └── jeweler/
├── context/
├── hooks/
├── i18n/
├── styles/
├── lib/sdk/
├── tests/
└── public/
```

### Backend Repository

```
/backend
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── stories/
│   │   ├── sketches/
│   │   ├── products/
│   │   ├── gifts/
│   │   ├── checkout/
│   │   ├── admin/
│   │   └── analytics/
│   ├── services/
│   └── utils/
├── redis/
├── prisma/
├── jobs/
│   └── sketchProcessor.worker.ts
└── tests/
```

---

## Feature Specifications

### Feature 1: Emotion-Driven Story Capture

**Goal**: Capture user stories via voice or text, analyze emotional content, guide via a persona assistant, and submit for sketching.

**API Relationships**:

- `POST /api/story`
- `POST /api/emotion`

**Requirements**:

- Voice/text toggle with real-time transcription (WebRTC/MediaRecorder)
- RTL layout with Hebrew-first language support
- GPT-4o used to transcribe and analyze emotions (1-3 tags)
- Persona-guided assistant using a Yes-And flow
- Story preview with edit option

**Implementation Guide**:

1. **Frontend**:

   - Component: `<StoryCapture />`, `<AssistantFlow />`, `<EmotionTagEditor />`
   - Use `react-hook-form` for validations
   - Use `framer-motion` for transitions
   - State: stored in React Context

2. **Backend**:

   - Route `/api/emotion` calls GPT-4o, caches in Redis for TTL 6hr
   - Emotion tagging saved in Supabase `stories` table
   - POST to `/api/story` stores full story and tags

3. **DB Schema**:

```sql
stories(id, user_id, text, emotion_tags[], created_at)
```

4. **Security**:

- Rate limiting via `rate-limiter-flexible`
- JWT auth from Supabase

5. **Testing**:

- E2E test with Playwright for voice-to-tag completion
- Unit tests for tag parser and emotion model

---

### Feature 2: AI Sketch Generation

**Goal**: Generate multiple sketch variants from user story + emotion tags

**API Relationships**:

- `POST /api/sketch/start`
- `GET /api/sketch/:id`

**Requirements**:

- Prompt construction using emotion + story
- DALL·E/SDXL backend integration
- Queue system via BullMQ, worker retries
- Sketch viewer with emotional context display
- Admin dashboard to monitor queue

**Implementation Guide**:

1. **Frontend**:

   - Components: `<SketchLoading />`, `<SketchViewer />`
   - Emotion context shown on viewer

2. **Backend**:

   - Worker triggered by `/api/sketch/start`
   - Sketch result pushed to AWS S3
   - Sketch entry created in `sketches` table

3. **DB Schema**:

```sql
sketches(id, story_id, url, variant_num, emotion_tags[], status, created_at)
```

4. **Scaling**:

- Use Redis and BullMQ
- 5 concurrent workers
- Retry on failure with backoff

5. **Testing**:

- Monitor sketch latency (<2 min)
- Queue size alerts if >5 unprocessed

---

### Feature 3: Proposal Matching & Product Flow

**Goal**: Match sketches to emotionally relevant jewelry

**API Relationships**:

- `GET /api/products?emotion=joy`
- `POST /api/match-log`

**Requirements**:

- Use emotion-tag → style-tag dictionary
- Tag-based filtering for product browsing
- Proposal preview and feedback (rating, comments)
- Discover jeweler profile from product

**Implementation Guide**:

1. **Frontend**:

   - Components: `<ProposalPreview />`, `<ProductGrid />`, `<FeedbackForm />`
   - Query params to filter products

2. **Backend**:

   - Matching via SQL tag match (`style_tags && emotion_tags`)
   - Save match logs for analytics

3. **DB Schema**:

```sql
products(id, jeweler_id, title, description, style_tags[], images[])
match_logs(id, sketch_id, product_id, score, feedback)
```

4. **Security**:

- JWT auth with access control by role

5. **Testing**:

- Integration tests on product match flow
- A/B tests on match success rate

---

### Feature 4: Gift Creation & Sharing

**Goal**: Create a gift experience with message and animated wrap, and share via a link

**API Relationships**:

- `POST /api/gift`
- `GET /gift/:token`

**Requirements**:

- Voice/text message input (ElevenLabs for TTS)
- Gift wrap animation (5+ themes)
- Tokenized public gift URL
- Reaction collection (heart, wow, etc.)

**Implementation Guide**:

1. **Frontend**:

   - Components: `<GiftEditor />`, `<GiftPreview />`, `<GiftViewer />`
   - Responsive animation rendering

2. **Backend**:

   - Voice stored in S3
   - Gift record saved in Supabase

3. **DB Schema**:

```sql
gifts(id, sketch_id, user_id, message_text, voice_url, wrap_theme, token, reactions[], created_at)
```

4. **Security**:

- Tokens expire in 30 days
- Abuse monitoring with rate limit

5. **Testing**:

- Audio compression + playback validation
- Reaction analytics collection

---

### Feature 5: Jeweler Tools

**Goal**: Give jewelers tools to manage profiles, respond to sketches, and track performance

**API Relationships**:

- `POST /api/products`
- `GET /api/jewelers/:id`

**Requirements**:

- Upload jewelry items (3-5 images)
- Add style tags (autocompletion from emotion tags)
- Profile edit (bio, avatar, categories)
- Dashboard with metrics (views, proposals)

**Implementation Guide**:

1. **Frontend**:

   - Components: `<JewelerDashboard />`, `<ProductForm />`, `<ProfileEditor />`

2. **Backend**:

   - Images compressed using sharp
   - Role-based auth for jeweler endpoints

3. **DB Schema**:

```sql
jewelers(id, user_id, bio, avatar_url, location, categories[])
products(id, jeweler_id, ...)
```

4. **Testing**:

- Upload pipeline validation
- Dashboard data accuracy

---

### Feature 6: Checkout & Payments

**Goal**: Enable purchase flow with Stripe + PayPlus, confirm and issue receipt

**API Relationships**:

- `POST /api/checkout/start`
- `POST /api/payment/webhook`

**Requirements**:

- Checkout UI with validation
- Stripe for global, PayPlus for IL
- Status update on webhook
- Retry on failure

**Implementation Guide**:

1. **Frontend**:

   - Components: `<CheckoutForm />`, `<Confirmation />`

2. **Backend**:

   - Stripe and PayPlus clients
   - Webhook route for order updates
   - Email receipts via AWS SES

3. **DB Schema**:

```sql
orders(id, user_id, product_id, status, payment_provider, receipt_url, created_at)
```

4. **Security**:

- HMAC signature validation on webhooks
- Sensitive data not stored

5. **Testing**:

- Simulated payment flows
- Webhook failure scenarios

---

### Feature 7: Admin & Analytics

**Goal**: Give admin ability to monitor system health and improve engagement

**API Relationships**:

- `GET /api/admin/metrics`
- `GET /api/logs`

**Requirements**:

- Metrics dashboard (story rate, match success, sketch times)
- A/B test tracking
- Slack alerts (sketch fails, payments)
- Log viewer with filters

**Implementation Guide**:

1. **Frontend**:

   - Components: `<AdminDashboard />`, `<LogViewer />`

2. **Backend**:

   - Posthog for session/engagement
   - Supabase logs + metrics tables
   - Slack integration

3. **DB Schema**:

```sql
logs(id, type, user_id, session_id, payload, timestamp)
ab_tests(id, user_id, variant_id, result)
```

4. **Testing**:

- Alert threshold triggers
- Metrics visualization accuracy
