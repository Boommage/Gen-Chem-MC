# Neocortex

Team 4's General Chemistry metacognition project. This `codex/image-integration-test` branch adds image attachments to the working Gemma Coach: previews/removal, multimodal requests, follow-up context, and attachment-preserving retry/edit recovery. Text chat and the Thinking animation remain available. Assistant replies now render Markdown and math, hidden model reasoning is disabled, and the gateway emits sanitized token-usage logs.

**Use an image-enabled backend.** The shared text Worker does not accept images. Follow [image setup](../docs/gemma-image-setup.md) for local live testing or a separate shared image Worker.

## Get this branch

Use Node.js **22.18 or newer** (Node 24 LTS recommended), npm, and Git.

```bash
git clone --branch codex/image-integration-test https://github.com/Boommage/Gen-Chem-MC.git
cd Gen-Chem-MC/gen-chem-mc
npm ci
```

Already cloned?

```bash
git fetch origin
git switch codex/image-integration-test
git pull --ff-only origin codex/image-integration-test
cd gen-chem-mc
npm ci
```

## Choose how to run Coach

| Mode | Cloudflare login on your machine? | Setup |
|---|---|---|
| Shared live backend (recommended for teammates) | No | Team endpoint owner supplies its URL and development token |
| Local mock | No | Canned responses for UI testing; not Gemma |
| Local Worker with live Gemma | Yes | Your own Cloudflare login with access to the intended account |

Image-branch setup, deployment, and troubleshooting: **[Gemma image setup](../docs/gemma-image-setup.md)**.

The [Word onboarding document](../docs/gemma-team-onboarding.docx) covers the stable text branch. Use the image guide above for this branch.

### Shared live backend

After the endpoint owner deploys the separate image Worker, set its actual origin and privately shared token in `.env.local`:

```dotenv
COACH_API_URL=https://ACTUAL-IMAGE-WORKER-URL
COACH_API_TOKEN=YOUR-TEAM-DEVELOPMENT-TOKEN
```

```bash
npm run dev
```

Open http://127.0.0.1:5173/coach. The token is read by Vite's local proxy; it is never a `VITE_` environment variable or browser request credential. Keep the local server bound to your own machine.

### Mock mode

Change the endpoint to `http://127.0.0.1:8787` and leave the token empty in your local configuration. Open two terminals in `gen-chem-mc`:

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

In a second terminal, run `npm run dev`. Set `COACH_API_URL=http://127.0.0.1:8787` and leave `COACH_API_TOKEN` empty in `.env.local`. Wrangler runs the Worker locally, but the AI binding connects to Cloudflare; internet access and free inference quota are required.

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
| npm run deploy:images | Deploy a separate shared image Worker; endpoint owner only |

## Implementation

```text
docs/gemma-setup.md             Team setup and live acceptance
gen-chem-mc/
  backend/worker.ts            Cloudflare runtime entry point
  backend/model.ts             Gemma gateway, validation, multimodal mapping
  backend/policy.ts            Coaching instructions
  backend/dev-mock.ts          Local mock server
  shared/coach.ts              Chat contract and history bounds
  shared/images.ts             Upload limits and image-header validation
  src/pages/Coach.tsx          Chat, thinking state, error recovery
  vite.config.ts              Local proxy, server-only development token
  wrangler.jsonc              Local and team Worker configurations
```

Gemma model: `@cf/google/gemma-4-26b-a4b-it`. The server prepends its own policy, restricts text/history size, returns final content only, and maps provider errors to understandable messages. Recent whole conversation pairs are sent within a bounded context. Leaving Coach or refreshing clears its current history.

## Scope and limitations

- This branch is a **team development text prototype**, not a student production deployment.
- One JPEG/PNG per message, up to 2 MB; up to two images in recent context. Images are not stored persistently by the application.
- No instructor-approved course retrieval, persistent chat database, student authentication, or analytics.
- The shared development token protects the hosted Worker; it is not student identity or authorization.
- Coaching instructions and basic output validation do not guarantee no answer leakage. Test with the instructor/TA before a student pilot.
- Provider timeouts stop waiting but may not cancel inference already running on Cloudflare. A retry may consume another request.
- All members of the same Cloudflare account share its allocation. Use Workers Free for the $0 test; the code does not enable paid fallbacks.
- The Vite proxy works for `npm run dev` only. A static production build does not include that proxy; do not publish a token in frontend variables to compensate.

## Contributing

Keep changes on a separate branch. Run `npm run check` before opening a PR. Never commit tokens, `.env.local`, `.dev.vars`, `.wrangler`, `node_modules`, or `dist`. Preserve the shared layout and warm off-white/dark-green design.
