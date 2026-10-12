# Neocortex

Team 4's General Chemistry metacognition project. The `gemma-integration-test` branch adds text coaching through Cloudflare-hosted Gemma 4 26B, an accessible thinking animation, conversation context, and retry/edit recovery.

## Get this branch

Use Node.js **22.18 or newer** (Node 24 LTS recommended), npm, and Git.

```bash
git clone --branch gemma-integration-test https://github.com/Boommage/Gen-Chem-MC.git
cd Gen-Chem-MC/gen-chem-mc
npm ci
```

Already cloned?

```bash
git fetch origin
git switch gemma-integration-test
cd gen-chem-mc
npm ci
```

## Choose how to run Coach

| Mode | Cloudflare login on your machine? | Setup |
|---|---|---|
| Shared live backend (recommended for teammates) | No | Team endpoint owner supplies its URL and development token |
| Local mock | No | Canned responses for UI testing; not Gemma |
| Local Worker with live Gemma | Yes | Your own Cloudflare login with access to the intended account |

Full setup, the one-time shared backend deployment, and troubleshooting: **[Gemma team setup](../docs/gemma-setup.md)**.

### Shared live backend

Copy `.env.example` to `.env.local` and fill in the actual team endpoint:

```dotenv
COACH_API_URL=https://YOUR-TEAM-WORKER.YOUR-SUBDOMAIN.workers.dev
COACH_API_TOKEN=YOUR-TEAM-DEVELOPMENT-TOKEN
```

```bash
npm run dev
```

Open http://127.0.0.1:5173/coach. The token is read by Vite's local proxy; it is never a `VITE_` environment variable or browser request credential. Keep the local server bound to your own machine.

### Mock mode

Leave the endpoint at `http://127.0.0.1:8787` and the token empty in your local configuration. Open two terminals in `gen-chem-mc`:

```bash
# Terminal 1
npm run dev:mock
```

```bash
# Terminal 2
npm run dev
```

Send a message on Coach. A mock badge distinguishes canned replies from live model output. This mode requires no Cloudflare account and makes no model calls.

### Local live Worker

```bash
npx wrangler login
npx wrangler whoami
npm run dev:api
```

In a second terminal, run `npm run dev`. Leave the local endpoint/token defaults. Wrangler runs the Worker locally, but the AI binding connects to Cloudflare; internet access and free inference quota are required.

## Verification

```bash
npm run check
```

Runs lint, backend TypeScript checking, automated tests, and the frontend production build. Automated tests use mocked inference and do not prove live chemistry accuracy, coaching compliance, account permissions, or quota availability. The live acceptance checklist is in [Gemma team setup](../docs/gemma-setup.md).

## Commands

| Command | Purpose |
|---|---|
| npm run dev | Frontend with a local server proxy to the configured backend |
| npm run dev:mock | Local canned-response backend |
| npm run dev:api | Local Cloudflare Worker with remote AI binding |
| npm run test | Backend, context-budget, and Coach interaction tests |
| npm run typecheck:api | Backend and shared contract type checking |
| npm run lint | Oxlint |
| npm run build | Frontend TypeScript checks and production bundle |
| npm run check | All automated checks |
| npm run deploy:team | Deploy the shared Worker; endpoint owner only |

## Implementation

```text
docs/gemma-setup.md             Team setup and live acceptance
gen-chem-mc/
  backend/model.ts             Gemma gateway, validation, shared-endpoint access
  backend/policy.ts            Coaching instructions
  backend/dev-mock.ts          Local mock server
  shared/coach.ts              Chat contract and history bounds
  src/pages/Coach.tsx          Chat, thinking state, error recovery
  vite.config.ts              Local proxy, server-only development token
  wrangler.jsonc              Local and team Worker configurations
```

Gemma model: `@cf/google/gemma-4-26b-a4b-it`. The server prepends its own policy, restricts text/history size, returns final content only, and maps provider errors to understandable messages. Recent whole conversation pairs are sent within a bounded context. Leaving Coach or refreshing clears its current history.

## Scope and limitations

- This branch is a **team development text prototype**, not a student production deployment.
- No image upload interface yet. Add it after the live text acceptance checklist passes.
- No instructor-approved course retrieval, persistent chat database, student authentication, or analytics.
- The shared development token protects the hosted Worker; it is not student identity or authorization.
- Coaching instructions and basic output validation do not guarantee no answer leakage. Test with the instructor/TA before a student pilot.
- Provider timeouts stop waiting but may not cancel inference already running on Cloudflare. A retry may consume another request.
- All members of the same Cloudflare account share its allocation. Use Workers Free for the $0 test; the code does not enable paid fallbacks.
- The Vite proxy works for `npm run dev` only. A static production build does not include that proxy; do not publish a token in frontend variables to compensate.

## Contributing

Keep changes on a separate branch. Run `npm run check` before opening a PR. Never commit tokens, `.env.local`, `.dev.vars`, `.wrangler`, `node_modules`, or `dist`. Preserve the shared layout and warm off-white/dark-green design.
