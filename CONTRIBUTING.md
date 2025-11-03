# Contributing to FakeVerifier

Thanks for your interest in contributing! This guide outlines how to propose changes, report issues, and follow our standards.

## Code of Conduct
By participating, you agree to uphold a respectful, inclusive environment. Treat everyone with kindness and assume positive intent.

## Getting Started
1. Fork the repository and create your feature/bug branch from `main`:
   - `feat/<short-feature-name>` for features
   - `fix/<short-bug-description>` for fixes
   - `docs/<short-docs-topic>` for documentation-only changes
2. Install dependencies and set up environment variables (see README).
3. Run the app locally and ensure your changes work end-to-end.

## Development Standards
- TypeScript preferred; write clear, descriptive names (no 1–2 letter vars).
- Avoid deep nesting and unnecessary try/catch; use guard clauses.
- Keep comments short and only for non-obvious rationale.
- Do not commit secrets or credentials. Use `.env.local` only.
- Match existing formatting; do not reformat unrelated code.

### Linting & Formatting
- Ensure no TypeScript or ESLint errors before committing.
- Keep imports organized and unused code removed.

### Testing
- Add unit tests where it makes sense for critical logic.
- Manually verify major flows:
  - `/verify` page submits and renders responses
  - Model selector defaults to OpenAI and can switch models
  - Fallback to HF works when OpenAI times out

## Commit Messages
Follow conventional commits where possible:
- `feat: add OpenAI timeout and fallback`
- `fix: handle SSE errors in stream route`
- `docs: update README for env setup`
- `refactor: simplify model selector logic`

Keep messages concise and meaningful. Use the imperative mood ("add", not "added").

## Pull Requests
- Rebase on `main` and resolve conflicts locally.
- Keep PRs focused and under ~500 lines of diff when possible.
- Fill in the PR template (if present):
  - Summary of changes
  - Motivation/context
  - Screenshots for UI changes
  - Risk and rollback plan
- Ensure CI (if configured) passes.

## Project Conventions
- Default model is OpenAI Agent Builder across all plans.
- Backend timeouts: 55s for OpenAI (ensure Vercel maxDuration >= 60s).
- Always return a response: if OpenAI fails, fallback to HF.
- Respect plan-based image limits (free/pro/enterprise) in `app/api/verify/route.ts`.
- Prefer server-side retries via `lib/network-utils.ts` for network calls.

## Security & Privacy
- Never log secrets or personally identifiable information (PII).
- When adding logs, prefer structured, minimal context.
- Keep sensitive checks (e.g., personal attributes) compliant with policy.

## Issue Reporting
When filing an issue, include:
- Reproduction steps
- Expected vs actual behavior
- Logs (sanitized) and environment details
- Screenshots or recordings when applicable

## Release & Versioning
- We currently release continuously from `main`.
- Tag significant milestones following semver conventions where feasible.

## Questions?
Open a GitHub Discussion or issue and tag it with `question`.

We appreciate your contributions — thank you!


