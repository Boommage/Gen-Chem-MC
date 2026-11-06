# Gemma Coach: text and images

Gemma is the selected model for Neocortex Coach. The integration branch **`codex/gemma-unified-integration`** combines the tested text and image implementations on the latest `main`, without merging into `main` yet.

## One endpoint and the same token

The canonical shared backend is the existing text Worker:

**`https://neocortex-gemma-team.neocortexmc.workers.dev`**

It serves both text and JPEG/PNG conversations after the endpoint owner deploys this branch. Existing text clients keep their request shape, URL, and team token. There is no separate model selection or image URL to configure.

Existing `.env.local` files are not rewritten by branch checkout, dependency installation, or deployment. Keep yours. The previous image-test Worker is not deleted; users already testing against it can keep using it, but new setup and future unified deployments use the canonical endpoint above.

## Every teammate

Use Git and Node **22.18+**. Preserve uncommitted work before switching. From the repository root:

```bash
git fetch origin
git switch codex/gemma-unified-integration
git pull --ff-only origin codex/gemma-unified-integration
cd gen-chem-mc
npm ci
```

If your `.env.local` already contains the original text Worker URL and team token, no configuration changes are needed. New checkouts copy `.env.example` to `.env.local` and privately fill in the existing team token:

```dotenv
COACH_API_URL=https://neocortex-gemma-team.neocortexmc.workers.dev
COACH_API_TOKEN=YOUR-EXISTING-TEAM-TOKEN
```

Use exactly one active entry per setting. The URL is the origin only, without `/api/coach`. Never prefix the token with `VITE_`, paste it into screenshots, or commit it. Restart the frontend after any intentional local configuration change.

```bash
npm run dev
```

Open **http://127.0.0.1:5173/coach**. This command starts only the frontend. In shared mode, Cloudflare already hosts the backend; teammates do not run `dev:api`, sign into Cloudflare, or deploy a Worker.

On Windows, use `npm.cmd` / `npx.cmd` if PowerShell blocks npm scripts. On Linux/macOS, use `npm` / `npx`; `.cmd` commands are Windows-specific. Run npm commands inside `gen-chem-mc`, not the outer repository folder.

## Endpoint owner: upgrade the existing Worker

From `gen-chem-mc` on this branch:

```bash
npm ci
npm run check
npx wrangler login
npx wrangler whoami
npm run deploy:team
```

`deploy:team` targets **`neocortex-gemma-team`**, upgrading the original URL with both text and image support. It does not deploy or delete the former `neocortex-gemma-images` test Worker. Check the intended account before deploying. This code deployment reuses the existing `TEAM_API_TOKEN`; do not rotate it just to enable images.

Only if the target Worker has never had its access secret configured, set it privately before deployment:

```bash
npx wrangler secret put TEAM_API_TOKEN --env team
```

Use the existing team development token. `COACH_API_TOKEN` is the teammate's local proxy setting; `TEAM_API_TOKEN` is the matching Worker secret. Teammates never need a Cloudflare account token or password.

After deployment, check `/api/health` through the frontend proxy. It must return `capabilities.images: true`. Verify an existing text request, an image request, and a follow-up using the same endpoint and token. A direct browser visit to the Worker without authentication normally returns 401.

## Optional local live mode

Only use this mode if you intend to run the backend yourself. It requires a Cloudflare login because the local Worker calls the remote Gemma binding. Configure local mode in your own `.env.local`:

```dotenv
COACH_API_URL=http://127.0.0.1:8787
COACH_API_TOKEN=
```

Run from `gen-chem-mc`:

```bash
# Terminal 1: backend
npx wrangler login
npm run dev:api
```

```bash
# Terminal 2: frontend
npm run dev
```

Keep both terminals open. Browse port **5173**; port **8787** is the API, not the website. A health check at http://127.0.0.1:8787/api/health should advertise images. Do not use local-mode settings when you mean to use the hosted endpoint.

## Optional mock mode

With the local URL and blank token above, run `npm run dev:mock` instead of `dev:api`, then run `npm run dev` in a second terminal. The mock accepts validated uploads but returns explicitly labeled canned replies. It does not interpret image pixels or report real Gemma usage.

## Features and bounds

- One Gemma model, `@cf/google/gemma-4-26b-a4b-it`, handles text, images, and mixed follow-ups through `POST /api/coach`.
- Hidden model reasoning is disabled with `chat_template_kwargs: { enable_thinking: false }`; the visible Thinking animation remains a loading indicator. The final reply budget stays at 1,024 completion tokens. Incomplete replies are rejected without an automatic extra inference call.
- Assistant messages render Markdown and KaTeX math: `$\lambda$`, `$H_2O$`, `$x^2$`, and display equations between `$$` lines. Student captions and stored conversation source remain unchanged. Raw HTML, remote Markdown images, and trusted LaTeX commands are disabled.
- One JPEG/PNG per user message, up to 2 MiB, 4096 pixels per side, and 12 megapixels. Crop larger photos. Backend checks independently validate the uploaded bytes; remote image URLs, SVG, PDF, GIF, audio, and video are rejected.
- Up to two recent images, 21 alternating messages, 2,000 characters per message, and 12,000 history characters. Oldest complete conversation pairs are trimmed to fit. The request-body limit allows two bounded images plus text.
- Retry preserves the pending caption and image; Edit restores them. Duplicate sends are blocked while an image is being read or a reply is generating. Leaving Coach or refreshing clears the conversation.
- Embedded instructions in an image do not override coaching rules. Blurry or ambiguous symbols should prompt clarification, not a guessed solution.

## Logs and token usage

Open **Workers & Pages > neocortex-gemma-team > Observability** and filter for `coach_usage`, or stream events:

```bash
npx wrangler tail --env team --format json
```

Invocation/custom logs are persisted at sampling rate 1. Custom events contain provider-reported `prompt_tokens`, `completion_tokens`, `total_tokens`, model, outcome, and duration. They omit uploaded bytes, chat text, instructions, responses, reasoning, headers, credentials, and raw provider errors. Standard invocation logs still contain Cloudflare request metadata.

Missing counts stay `null`, never a guessed zero. Include `invalid_reply` events when inspecting consumption. Errors/timeouts can leave usage unknown, and timeouts may not stop provider inference; retained log totals are not a permanent or complete billing ledger. Use the Workers AI dashboard for account-wide allowance. Local Worker events print in its terminal, not the hosted Worker's log list.

## Verification and troubleshooting

`npm run check` runs lint, backend type checking, all automated tests, and the frontend build. Tests cover text compatibility, image validation and history, auth refusals, formatting, usage-event privacy, Thinking state, and retry/edit behavior. They mock inference; also test a fabricated image, a text follow-up, and a phone-sized browser against the actual endpoint.

| Symptom | Action |
|---|---|
| Missing `package.json` / ENOENT | Run npm commands inside `gen-chem-mc` |
| `npm.cmd` is not recognized on Linux | Use `npm`; `.cmd` is Windows-specific |
| Images unavailable but text works | Endpoint owner deploys this branch with `npm run deploy:team`; keep the original URL/token |
| HTTP 502 / connection refused | Shared mode: check the hosted service. Local mode: run `dev:api` in the other terminal and confirm the local URL |
| 401 | Check the existing team token and restart Vite; do not prefix it with `VITE_` |
| 503 / not configured | Endpoint owner checks `TEAM_API_TOKEN` on the canonical Worker |
| Missing `deploy:images` | This branch uses `npm run deploy:team` for both modalities |
| Image rejected | Use a clear, valid JPEG/PNG within size and dimension limits |
| 429 | Account allowance or capacity is exhausted; retry later, with no automatic paid fallback |
| Timeout or unusable reply | Retry once; inspect safe status/usage metadata rather than private message content |
| Works in development but not static hosting | The Vite proxy is development-only; production needs a secured backend route |

This is a team development prototype. The token is not student authentication. Student identity, course authorization, instructor retrieval, persistent chat, and institutional processing decisions remain separate work. Instructor/TA evaluation is still required for chemistry accuracy and coaching compliance. The existing Word onboarding document describes an earlier text-only milestone; this guide is the current setup reference.
