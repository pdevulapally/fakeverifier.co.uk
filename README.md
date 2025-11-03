# FakeVerifier AI

FakeVerifier is a modern, production-ready AI assistant focused on fast, transparent fact-checking of claims, headlines, and URLs. It combines an OpenAI Agent Builder workflow (default for all plans) with a robust Hugging Face classifier fallback to ensure reliability under variable network conditions. The app includes a rich UI for uploading context, managing conversations, and inspecting evidence.

## TL;DR
- Default model: OpenAI Agent Builder (with web search and evidence), consistent across Free/Pro/Enterprise.
- Automatic fallback: Hugging Face FakeVerifier classifier when OpenAI times out or is unavailable.
- Quotas and plans: Per-user daily/monthly quotas via Firebase.
- Mobile-friendly UI with dynamic model switching and file previews.
- Deployed on Vercel; API routes are Next.js App Router handlers.

## Key Features
- OpenAI Agent Builder workflow for full fact-checking responses
- Reliable HF fallback to avoid user-visible failures
- Intelligent model selection UI (always defaults to OpenAI; switchable by user)
- Timeline/status stream for in-flight analysis
- Per-plan image attachment limits
- Safety rails for sensitive personal attributes
- Conversation history, memory hints, and feedback capture

## Architecture
- Next.js (App Router) + React TypeScript UI
- API routes under `app/api/*`
- Client components under `components/*`
- Model integrations in `lib/*`

### Core Files
- API (verify): `app/api/verify/route.ts`
  - Default to OpenAI Agent Builder; fallback to HF FakeVerifier
  - Robust error handling and timeouts (55s) with Vercel function duration alignment
  - Quota checks and plan-based image limits
  - Safety heuristics for sensitive claims
- Agent runner: `lib/openaiAgent.ts`
  - Defines instructions and executes the Agent Builder workflow
- HF client: `lib/fakeVerifierClient.ts`
  - Calls Hugging Face Space/endpoint and parses classifier output
- Input UI: `components/ui/animated-ai-input.tsx`
  - Model selector (always visible when multiple models exist)
  - Defaults to OpenAI Agent Builder for all plans
  - File upload (with previews) and pasted content support
- Verify page: `app/verify/page.tsx`
  - Sends requests to `/api/verify` with selected model
  - Shows a staged timeline via `/api/verify/stream`

## Data Flow
1. User enters a claim/URL in the input and selects a model (defaults to OpenAI Agent Builder).
2. Frontend calls `/api/verify` with the input, context, and optional images.
3. Server attempts OpenAI Agent Builder with a 55s timeout; on any failure it falls back to the HF classifier.
4. Response JSON returns verdict, confidence, explanation, sources, and friendly markdown.
5. Frontend displays the model response; evidence and follow-ups are included when available.

## Environment Configuration
Create a `.env.local` (or configure in your hosting provider) with the following as needed:

```
# OpenAI (optional but recommended)
OPENAI_API_KEY=sk-...

# Hugging Face (for fallback)
HUGGINGFACE_TOKEN=...
HF_TOKEN=...
# Optional: custom space/model variables if you use them
HF_MODEL_ID=...

# Search / news providers (optional, used by agent / helpers)
SERPER_API_KEY=...
NEWS_API_KEY=...
SERPAPI_KEY=...
TAVILY_API_KEY=...

# Firebase Admin (for quotas, plans, usage tracking)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...  # keep with proper escaping if needed
```

Notes:
- If `OPENAI_API_KEY` is not set, the app will automatically use the HF fallback.
- If search/news keys are not configured, the agent can still operate but may cite fewer sources.

## Quotas and Plans
- Token/usage tracking is stored in Firebase (see `lib/firebaseAdmin.ts`).
- The verify API charges 1 token per verification (`ensureQuota`).
- Per-plan daily/monthly totals are enforced. The UI surfaces quota state and prompts upgrades.
- Image limits by plan:
  - Free: 1
  - Pro: 3
  - Enterprise: 10

## Running Locally
1. Install dependencies
   ```bash
   pnpm install
   # or npm install / yarn install
   ```
2. Configure environment variables in `.env.local` (see above).
3. Start the dev server
   ```bash
   pnpm dev
   # or npm run dev / yarn dev
   ```
4. Open `http://localhost:3000/verify`.

## Deployment
- Recommended: Vercel (project is optimized for Vercel Functions)
- Ensure function execution time aligns with your plan. We use a 55s OpenAI timeout to fit within a 60s function window.
- Set all required environment variables in the hosting provider.

## Troubleshooting
- "Analyzing…" stalls / no answer:
  - Check server logs for OpenAI timeout or network errors; fallback should engage automatically.
  - Verify environment variables (`/api/env-check` route may help).
- Network errors on mobile:
  - The app uses a robust `fetchWithRetry` and SSE for timeline streaming; verify CORS headers and connectivity.
- Missing sources in responses:
  - Ensure search/news keys are configured; otherwise evidence depth may be limited.

## Security & Safety
- Heuristics prevent definitive verdicts about sensitive personal attributes without self-identification.
- Sources are normalized and displayed clearly to reduce hallucinations.
- Avoid logging PII; sensitive fields should be anonymized in logs.

## Roadmap
- Improve NER-based detection for sensitive topics (replace heuristics)
- Expand model options and add server-side routing policies
- Add E2E tests and load testing profiles
- Export/share verified reports and citations

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards, branching strategy, commit conventions, and PR process.

## License
Copyright (c) 2025 FakeVerifier Authors. All rights reserved.

If you are evaluating licensing changes (e.g., MIT), update this section accordingly.

# FakeVerifier (MVP)

## Setup
1. Copy `.env.local.example` to `.env.local` and fill keys.
2. `npm install`
3. `npm run dev`

## Notes
- API route: `app/api/verify/route.ts`
- Libs: `lib/ingest`, `lib/retrieve`, `lib/agents/*`, `lib/llm`, `lib/quota`, `lib/firebaseAdmin`.
- Firestore rules: `firestore.rules`
- Replace demo `uid` in `app/page.tsx` with real Auth.

