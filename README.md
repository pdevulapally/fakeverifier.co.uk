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

