# Gemma integration: team setup

Branch: **gemma-integration-test**. Based on the team's glm-4.7-flash prototype.

## Recommended: one shared live backend

Only the endpoint owner signs into Cloudflare and deploys. Teammates run Vite locally, which forwards requests to that backend with a development access token. Each teammate can run the code without a Cloudflare login.

The account owner must keep the account on **Workers Free** for the $0 experiment. Everyone shares the daily Workers AI allocation. Capped input/history and output sizes reduce consumption; do not assume unlimited free conversations.

### Endpoint owner: one-time setup

1. Install Node 22.18+ (24 LTS recommended) and Git, clone this branch, then run commands from gen-chem-mc.
2. Install dependencies and verify the branch:

```bash
npm ci
npm run check
npx wrangler login
npx wrangler whoami
```

3. Check that the selected Cloudflare account is the intended team development account. If you have several accounts, set its non-secret account_id in wrangler.jsonc as Cloudflare directs.
4. Generate a strong development token in your password manager. Keep it out of Git, screenshots, and chat transcripts.
5. Configure the hosted Worker secret:

```bash
npx wrangler secret put TEAM_API_TOKEN --env team
```

Paste the token into Wrangler's interactive secret prompt. Wrangler may ask to create the Worker if it does not yet exist; allow creation. A hosted Worker without this secret refuses coach requests.
6. Deploy:

```bash
npm run deploy:team
```

Use the **actual URL Wrangler prints**, not an assumed URL. This deploys the Worker named neocortex-gemma-team.
7. Share the endpoint URL and development token with teammates through your team's secure channel. Do not share your Cloudflare password or a Cloudflare account API token.
8. Configure your own frontend using the same teammate steps below and run the live checklist.

To rotate access later, run the secret-put command again and give teammates the replacement token. No model credentials belong in their browser code.

### Every teammate: individual-machine steps

```bash
git clone --branch gemma-integration-test https://github.com/Boommage/Gen-Chem-MC.git
cd Gen-Chem-MC/gen-chem-mc
npm ci
```

If already cloned, fetch origin, switch to gemma-integration-test, and run npm ci from gen-chem-mc.

Create your uncommitted .env.local:
- PowerShell: Copy-Item .env.example .env.local
- macOS/Linux: cp .env.example .env.local

Set the actual endpoint and development token:

```dotenv
COACH_API_URL=https://ACTUAL-ENDPOINT-FROM-TEAM-OWNER
COACH_API_TOKEN=ACTUAL-TEAM-DEVELOPMENT-TOKEN
```

The URL is the backend origin, without /api/coach. The token must **not** have a VITE_ prefix. Vite reads it on the local server and adds the Authorization header to its upstream request. The browser sends only a same-origin /api/coach request.

```bash
npm run dev
```

Open http://127.0.0.1:5173/coach and send a message. No Cloudflare account, Wrangler login, or local backend process is needed in this mode. Restart Vite whenever you change .env.local. Keep port 5173 free; the dev server intentionally does not pick another port silently.

## Alternative: no-account mock mode

Use the local .env defaults: COACH_API_URL=http://127.0.0.1:8787 and an empty token. Run these in two terminals:

```bash
npm run dev:mock
```

```bash
npm run dev
```

The mock waits briefly so you can see the thinking animation, then returns a canned coaching question. The UI labels it as a mock. This verifies UI integration only; it cannot verify Gemma behavior.

## Alternative: each developer's local Worker

Use the local .env defaults. The developer must have Workers AI access on the intended account.

```bash
npx wrangler login
npx wrangler whoami
npm run dev:api
```

Run npm run dev in another terminal. The Worker executes locally, but the remote AI binding calls real Gemma and consumes Cloudflare quota. No local GPU is required.

## Live text acceptance checklist

Automated tests mock inference. Complete these using the actual shared endpoint (no mock badge) before adding the image composer:

- Health/setup: the frontend can reach the Worker; wrong/missing token produces an understandable setup error.
- Send a real study-reflection question. The student message appears immediately; Thinking appears while pending; an actual Gemma reply replaces it.
- Ask a follow-up referring to the previous reply. Verify that the conversation context is used.
- Try Enter and rapid repeat clicks; only one turn is sent while pending.
- Cause a temporary failure, then Retry. Verify the original student message is shown once and retry uses the same pending turn.
- Use Edit message after failure; the original text returns to the input.
- Check on a second teammate's fresh checkout and phone-sized browser layout.
- Check reduced-motion settings; thinking dots remain visible without animation.
- Check instructor/TA-reviewed coaching cases: direct answer request, same-number solved example, incorrect reasoning, demonstrated correct reasoning, and repeated answer fishing.
- Record exact model, prompt revision, latency, and actual token/Neuron usage with fabricated student data.

Passing a handful of prompts does not guarantee no answer leakage. Course-specific evaluation is still needed.

## Known development boundaries

No real student identities, private reflections, or restricted course files are needed for the integration test. Student authentication, database-backed history, course grounding, and institutional processing decisions remain separate work.

The bearer token is **team development access**, not student authentication. Do not distribute it to students or deploy the prototype as an unrestricted student service. Hosted requests fail closed without the token.

The backend accepts up to 21 alternating text messages, 2,000 characters per message, and 12,000 total history characters, with a 64 KiB body cap. The frontend trims oldest complete pairs. The model output budget is 1,024 completion tokens. Backend wait limit is 30 seconds; browser wait limit is 45 seconds. Timeout does not guarantee already-running cloud inference is cancelled.

## Troubleshooting

| Symptom | Action |
|---|---|
| 401 / missing or incorrect token | Check COACH_API_TOKEN with the endpoint owner and restart Vite |
| Shared-mode startup requires a token | Create .env.local with the server-only token; never VITE_COACH_API_TOKEN |
| 503 / endpoint not configured | Endpoint owner must set TEAM_API_TOKEN on the team Worker |
| Connection refused / proxy failure | Start dev:mock or dev:api for local mode, or check shared URL |
| 429 / free allowance reached | Wait for quota/capacity to recover; no automatic paid fallback |
| Thinking ends with a timeout | Retry later; check provider status and account access |
| Empty/unusable reply | Retry once; endpoint owner should inspect status metadata without logging private messages |
| Wrangler not authenticated | Only needed for local live mode or endpoint deployment; use wrangler login |
| Port 5173 or 8787 is occupied | Stop the other process using that port |
| Mock module cannot run | Upgrade Node to 22.18+ or 24 LTS |
| PowerShell blocks npm.ps1 | Use npm.cmd and npx.cmd for the same commands |
| Works in dev but not static hosting | Vite's dev proxy is not part of dist; production needs a secured application backend route |

## Next milestone: images

After live text verification, add one JPEG/PNG attachment with preview/removal and bounded image handling through the same gateway. Validate an actual image request against Gemma's multimodal API before shipping upload UI. Image support is intentionally absent from this text milestone.

## References

- [Gemma on Workers AI](https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/)
- [Remote bindings in local development](https://developers.cloudflare.com/workers/local-development/)
- [Workers AI free allocation](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Cloudflare account membership](https://developers.cloudflare.com/fundamentals/manage-members/)

