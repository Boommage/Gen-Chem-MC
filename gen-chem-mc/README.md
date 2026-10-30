# Neocortex

Gemma is the selected Coach model. One backend serves text messages, uploaded images, and conversations that mix both. The integration branch is **`codex/gemma-unified-integration`**; `main` is unchanged until review and merge.

Coach includes accessible Thinking indicators, Markdown/KaTeX output, image previews/removal, recent conversation context, retry/edit recovery, and sanitized token-usage logs. Hidden model reasoning is disabled so the 1,024-token output budget is available for the final coaching reply.

## Start with the shared backend

Use Node **22.18+**, npm, and Git. From the repository root:

```bash
git fetch origin
git switch codex/gemma-unified-integration
git pull --ff-only origin codex/gemma-unified-integration
cd gen-chem-mc
npm ci
npm run dev
```

Keep your existing `.env.local` and development token. The original text endpoint now supports both text and images after the endpoint owner deploys this branch:

```dotenv
COACH_API_URL=https://neocortex-gemma-team.neocortexmc.workers.dev
COACH_API_TOKEN=YOUR-EXISTING-TEAM-TOKEN
```

Open http://127.0.0.1:5173/coach. `npm run dev` starts only the frontend, which proxies requests to the hosted backend. Teammates need no local backend process or Cloudflare login in this mode. On Windows, use `npm.cmd` and `npx.cmd` if PowerShell blocks the scripts; Linux/macOS use `npm` and `npx`.

For a new checkout, copy `.env.example` to `.env.local` and privately fill in the token. Never overwrite an existing local configuration just to update branches. The Vite server owns the token; never prefix it with `VITE_` or commit it.

## Commands

Run these from `gen-chem-mc`:

| Command | Purpose |
|---|---|
| `npm run dev` | Frontend on port 5173 |
| `npm run dev:api` | Local Worker on port 8787, calling real Cloudflare-hosted Gemma; Cloudflare login required |
| `npm run dev:mock` | Local canned-response backend on port 8787; no model calls |
| `npm run check` | Lint, backend type checks, tests, and frontend build |
| `npm run deploy:team` | Upgrade the existing shared text endpoint with text-and-image support; endpoint owner only |

The [Gemma setup guide](../docs/gemma-setup.md) covers local mode, deployment, upload limits, logs, and troubleshooting. The former separate image deployment is no longer the setup path for this branch. Existing image-test Worker users can continue testing against that deployed service; this branch does not delete it or rewrite their local settings.

## Implementation

| File | Responsibility |
|---|---|
| `backend/worker.ts` | Default-only Cloudflare runtime entrypoint |
| `backend/model.ts` | Authentication, validation, Gemma text/image requests, final replies, and usage logs |
| `backend/policy.ts` | Server-owned coaching and formatting instructions |
| `backend/dev-mock.ts` | Labeled mock replies |
| `shared/coach.ts` | Chat contract and history bounds |
| `shared/images.ts` | Image size, dimensions, MIME, and byte validation |
| `src/pages/Coach.tsx` | Messages, image composer, Thinking state, retry/edit |
| `src/components/CoachMessage.tsx` | Markdown and KaTeX rendering |
| `vite.config.ts` | Local frontend proxy and server-only token |
| `wrangler.jsonc` | Local AI binding and the canonical team deployment |

## Development guidelines

Use `AppLayout` and `PageHeader` for the shared shell and page headings. Preserve the warm off-white/dark-green design, keyboard access, reduced-motion support, and phone-width layout. Work on a branch and run `npm run check` before review. Repository opt-in use-case workflows are described in `AGENTS.md`.

## Development boundaries

This is a team development integration. The shared token is not student identity or course authorization. Student authentication, instructor-approved retrieval, persistent chat storage, and analytics are not implemented here. The Vite development proxy is not included in a static production build; production hosting needs a secured backend route.

Images remain in conversation memory and are sent to the AI provider, without persistent storage added by the app. Tests use fabricated content. Instructor/TA evaluation is still needed for coaching compliance, chemistry accuracy, and image interpretation. Provider timeouts may leave inference running; there is no automatic paid fallback or automatic extra inference retry.

The Word onboarding document is an earlier text-branch artifact. Use the Markdown setup guide for the current unified integration.
