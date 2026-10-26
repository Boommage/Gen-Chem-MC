# Gemma image integration test

Branch: `codex/image-integration-test`, based on the working `gemma-integration-test` branch.

This branch adds one JPEG or PNG attachment per Coach message, removable previews, submitted-image display, and multimodal Gemma requests. Text chat, thinking, follow-ups, and retry/edit recovery remain available. The shared text Worker is unchanged; images require this branch's backend.

It also includes the text branch's Markdown/KaTeX formatting and token usage logs. Gemma's hidden reasoning is disabled with `chat_template_kwargs: { enable_thinking: false }` for both text and image requests so it does not exhaust the 1,024-token completion budget before producing a final reply. The Thinking animation remains visible during generation. Student uploads and captions stay unchanged; assistant replies render symbols, fractions, subscripts, superscripts, bold text, lists, and tables.

## Get the branch

Use Node 22.18+ (24 LTS recommended). From your repository root:

```bash
git fetch origin
git switch codex/image-integration-test
git pull --ff-only origin codex/image-integration-test
cd gen-chem-mc
npm ci
```

Preserve local work before switching. The existing Word onboarding document describes the stable text branch; use this guide for images.

## Local live image testing

The developer running the local Worker needs a Cloudflare login. Edit your uncommitted `.env.local`:

```dotenv
COACH_API_URL=http://127.0.0.1:8787
COACH_API_TOKEN=
```

Run from `gen-chem-mc`:

```bash
npx wrangler login
npm run dev:api
```

In another terminal:

```bash
npm run dev
```

Open http://127.0.0.1:5173/coach. Attach a clear JPEG/PNG, add your question, and send. An image-only message uses a default coaching question. Thinking appears while the model responds.

On Windows, use `npx.cmd wrangler login`, `npm.cmd run dev:api`, and `npm.cmd run dev` if PowerShell blocks npm scripts. Keep both terminals running. `npm run dev` starts only the frontend; `npm run dev:api` starts only the local backend on port 8787. Save `.env.local` inside this checkout's `gen-chem-mc` folder, not a different clone, and restart Vite after changing it. To check the local backend without generating a reply, open http://127.0.0.1:8787/api/health and confirm `capabilities.images` is `true`.

The Worker executes locally; its remote AI binding calls real Gemma and consumes the account's allocation. Do not use the stable text Worker URL for images. Coach checks image capability before sending and reports when that server lacks image support.

## Shared image backend

One endpoint owner can deploy a separate Worker named `neocortex-gemma-images`. Teammates then run only the frontend, without individual Cloudflare logins.

From this branch, the endpoint owner runs:

```bash
npx wrangler login
npx wrangler secret put TEAM_API_TOKEN --env images
npm run deploy:images
```

Use a privately shared development token for the image Worker. It may be the existing team development token if that is your choice. Secrets are per Worker: the text Worker's secret is not inherited. Accept Worker creation if prompted, then use the actual URL printed by deployment.

Each teammate sets `.env.local`:

```dotenv
COACH_API_URL=https://ACTUAL-IMAGE-WORKER-URL
COACH_API_TOKEN=THE-IMAGE-WORKER-DEVELOPMENT-TOKEN
```

Restart `npm run dev`. Do not use a `VITE_` prefix. Use the base origin without `/api/coach` or a frontend port. Keep this file uncommitted.

Use `deploy:images` for this test. The stable text branch and Worker remain separate; `deploy:team` is not provided on this image branch.

After updating this branch, the endpoint owner must rerun `npm run deploy:images` for the hidden-reasoning fix and log configuration to take effect on the shared image backend. Each teammate pulls the branch, runs `npm ci`, and restarts `npm run dev` for the formatting dependencies. Do not deploy this code to the shared text Worker.

For image token usage, open **Workers & Pages > neocortex-gemma-images > Observability** and filter for `coach_usage`, or run `npx wrangler tail --env images --format json`. Persisted logs are enabled for the image environment. Custom events contain reported token counts, model, outcome, and timing; they omit uploaded bytes, captions, responses, reasoning, and credentials. Missing counts stay `null`, and failed/timed-out requests can make totals incomplete. Local Worker custom logs appear in its terminal rather than the hosted Worker's log list.

## No-account mock mode

Set the local URL above and leave the token empty. Run `npm run dev:mock` in one terminal and `npm run dev` in another. The mock accepts validated attachments and returns a labeled canned reply. It does not interpret pixels. This mode verifies the interface, not model vision.

## Upload limits and handling

- One JPEG or PNG per user message, up to 2 MiB (shown as 2 MB in the UI).
- Maximum 4096 pixels per side and 12 megapixels total. Crop/resize large camera photos first.
- Frontend checks file type, size, headers, and browser decodability. Backend independently checks encoded size, base64 format, MIME/signature agreement, dimensions, and user-only attachment placement.
- Only embedded uploaded bytes are accepted. Remote URLs, SVG, PDF, GIF, audio, and video are rejected; the backend never fetches arbitrary image URLs.
- At most two images are sent in recent context. Oldest complete user/assistant pairs are trimmed when image, text, or message-count budgets are exceeded.
- Images remain in browser memory during the conversation and are sent to Gemma. This branch adds no persistent image storage.
- Retry preserves the exact pending attachment; Edit message restores its caption and preview.
- Instructions in images cannot override the coaching policy. Ambiguous labels should lead to clarification rather than a guessed solution.

Images can consume more model quota than text. All calls using one Cloudflare account share its allocation. No automatic paid fallback is enabled.

## Verification

```bash
npm run check
```

Coverage includes PNG/JPEG bytes, spoofed/oversized uploads, remote-URL rejection, image-history bounds, previews/removal, capability checks, follow-ups, and retry/edit preservation, alongside the text tests.

During development, the local Worker returned HTTP 200 for a synthetic worksheet and correctly read the volume label as 2.0 L. A follow-up retained the image. A browser check verified preview/removal, a live image reply, mobile layout, and image retry without duplication. These tests establish the integration path, not universal chemistry accuracy or answer-leak resistance; instructor/TA evaluation remains necessary.

Manual checklist:
1. Attach and remove an image before sending.
2. Send an image and question, then a text follow-up about it.
3. Send an image without a caption.
4. Retry/edit a failed image turn and verify the attachment is preserved once.
5. Try an unsupported file or oversized photo.
6. Check a narrow screen and reduced-motion settings.
7. Evaluate direct-answer requests against the client rules.

## Troubleshooting

| Symptom | Action |
|---|---|
| Images are not available on this server | Run the image branch's local Worker or use the separate image Worker URL; restart Vite |
| The image coach could not be reached / HTTP 502 / connection refused | In local mode, run `npm run dev:api` in a second terminal and use `http://127.0.0.1:8787` in this checkout's `.env.local`. For shared mode, check the actual image Worker URL and token. Restart Vite, then Retry. |
| Image cannot be opened | Choose a valid JPEG/PNG or crop/resize the photo |
| 401 or 503 on the shared image backend | Set/check TEAM_API_TOKEN on the image Worker; the text secret is separate |
| 502 or timeout | Check the origin, retry later, and inspect status metadata without logging private messages |
| 429 | Wait for quota or capacity to recover; avoid repeated retries |
| Exported helper is not a Worker handler | Ensure wrangler.jsonc points to backend/worker.ts |

The [published Gemma schema](https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/sync-input.json) supports user content arrays with `text` and `image_url` parts.
