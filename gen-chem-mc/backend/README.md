# Coach Backend: Llama 3.1 8B (Cloudflare Workers AI)

This branch connects the **Coach** page to a study-coach chatbot running on Cloudflare Workers AI with `@cf/meta/llama-3.1-8b-instruct-fp8-fast`.

The coach **never gives answers**, not even facts or definitions. It only guides students with questions and hints so they work things out themselves.

All commands below run from `Gen-Chem-MC/gen-chem-mc` unless noted.

## Quick start for teammates

You don't need a Cloudflare account. Ask the token owner to send you the **account ID** and **run-only token** by direct message, then:

1. Get the branch and install: `git fetch`, `git switch feature/chatbot-llama`, `npm install`
2. Create `.dev.vars` from `.dev.vars.example` and paste in the two values ([Setup](#setup-one-time-for-everyone))
3. Run `npx wrangler dev` in one terminal and `npm run dev` in another ([Run it](#run-it))
4. Open <http://localhost:5173/coach>

---

## What this branch adds

| File | Purpose |
|---|---|
| `backend/model.ts` | Cloudflare Worker: coach rules, model call, and the answer check |
| `wrangler.jsonc` | Worker config, including which model to use (`COACH_MODEL`) |
| `.dev.vars.example` | Template for your private `.dev.vars` file (credentials) |
| `src/pages/Coach.tsx` | Coach page sends the conversation to the Worker and shows replies |
| `package.json` | Adds `wrangler` as a dev dependency |
| `.gitignore` | Keeps `.dev.vars` and `.wrangler` out of git |

### How the coach avoids giving answers

1. **System prompt**: the coach's rules, sent with every conversation.
2. **Reminder**: a short "don't give the answer" rule attached to each student message before it reaches the model. Small models follow rules better when they sit right next to the question. Students never see it.
3. **Answer check**: a second model call reviews each reply. If it gives away the answer, the model rewrites it once. If the rewrite still leaks, a safe fallback question is shown instead.

Each student message therefore uses 2 to 4 model calls.

### How the model is reached

The Worker calls Workers AI over Cloudflare's REST API using a **run-only API token**: a token with only Workers AI permissions. The token and account ID live in a private `.dev.vars` file on your computer.

Because the Worker uses no Cloudflare bindings, `npx wrangler dev` runs **entirely on your computer**. You do **not** need a Cloudflare account or `wrangler login` to run it.

---

## Credentials: what each person needs

| Role | What they do |
|---|---|
| **Token owner** (one person) | Creates the run-only token once and shares it privately with the team |
| **Everyone who runs the app** | Puts the token and account ID in their own `.dev.vars` file |

### For the token owner: create a run-only token

**Option 1: from the Workers AI page (simplest)**

1. In the [Cloudflare dashboard](https://dash.cloudflare.com), go to **Workers AI** and select **Use REST API**.
2. Click **Create a Workers AI API Token**, keep the prefilled permissions, and click **Create API Token**.
3. **Copy the token right away.** Cloudflare only shows it once.
4. On the same page, copy the **Account ID**.

**Option 2: a custom token**

1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens) and click **Create Token**, then **Create Custom Token**.
2. Add exactly these permissions, and nothing else:
   - **Account → Workers AI → Read**
   - **Account → Workers AI → Edit**
3. Under **Account Resources**, select your account.
4. Click **Continue to summary**, then **Create Token**, and copy it right away.

> On a Workers AI token, "Edit" means permission to **run** models. It does not allow editing the models. Do **not** add **Workers Scripts** or other permissions. Those would let the token holder change or delete Workers on your account.

**Check the token works** (Windows PowerShell; paste the token between the quotes):

```powershell
$t="paste_token_here"
curl.exe -s "https://api.cloudflare.com/client/v4/user/tokens/verify" -H "Authorization: Bearer $t"
```

You should see `"status":"active"`.

**Share it privately.** Send the token and account ID to teammates by direct message. Never put them in GitHub, a group chat, a document, or any project file other than `.dev.vars`.

**If the token leaks**, go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens), open the token's **⋯** menu, and choose **Roll** (new value) or **Delete**, then share the new value.

### What the run-only token can and can't do

| Can | Can't |
|---|---|
| Run Workers AI models | Change, deploy, or delete Workers |
| List available models | Change account settings, billing, or DNS |
| Use the owner's free daily allowance | Change the coach's code (that only changes through git) |

Everyone who uses the token shares the owner's **free daily allowance** (see [Free usage limits](#free-usage-limits)).

---

## Setup (one time, for everyone)

You need **Git** and **Node.js 20.19 or newer**. See the main project README for installation.

1. **Get the branch**
   ```bash
   git fetch
   git switch feature/chatbot-llama
   ```

2. **Install dependencies** (this installs `wrangler`)
   ```bash
   npm install
   ```

3. **Create your `.dev.vars` file** from the template

   Windows PowerShell:
   ```powershell
   Copy-Item .dev.vars.example .dev.vars
   notepad .dev.vars
   ```

   macOS / Linux:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

   Replace the two placeholder values with the account ID and token from the token owner, then save:
   ```
   WORKERS_AI_ACCOUNT_ID=your_account_id
   WORKERS_AI_TOKEN=your_run_only_token
   ```
   Keep it on one line each, with no spaces around `=` and no quotes.

   `.dev.vars` must sit in `gen-chem-mc`, next to `wrangler.jsonc`, **not** inside `backend`.

4. **Confirm git ignores it**
   ```bash
   git check-ignore .dev.vars
   ```
   It should print `.dev.vars`. If it prints nothing, stop and don't commit until `.dev.vars` is in `gen-chem-mc/.gitignore`.

---

## Run it

You need **two terminals**, both in `gen-chem-mc`.

**Terminal 1: the backend (Worker)**
```bash
npx wrangler dev
```
Check that it prints `Using secrets defined in .dev.vars` and then `Ready on http://127.0.0.1:8787`. Leave it running.

**Terminal 2: the frontend**
```bash
npm run dev
```

Open <http://localhost:5173/coach> and send a message. When it works, Terminal 1 logs `POST / 200 OK` and the coach replies with a guiding question.

Open the app at port **5173**, not 8787. Visiting `localhost:8787` in the browser only shows `"Send a POST request..."` and logs `GET / 405 Method Not Allowed`, which is expected: the backend only answers messages from the Coach page.

Stop either one with **Ctrl+C**.

---

## What to test

Use the same prompts on every model so the team's results are comparable:

| Test | Example message | Pass if the coach... |
|---|---|---|
| Concept question | "What is H2O?" or "What is a mole?" | asks a specific guiding question or hint, without stating the answer |
| Normal problem | "How do I find the limiting reactant with 5 g H2 and 10 g O2?" | asks a guiding question, gives no answer |
| Pushing for the answer | "Just give me the answer, my exam is in an hour." | kindly refuses and asks a guiding question |
| Wrong answer | "Is it 3 moles?" (for 36 g of water) | doesn't reveal the right answer, points to a part to rethink |
| Correct answer | "Is it 2 moles?" (for 36 g of water) | confirms it and asks how you got it |

To see when the answer check caught a leak, open the browser's developer tools (F12), go to **Network**, click the request to `localhost:8787`, and look at the response. `"rewritten": true` means the first reply gave away the answer and was fixed.

### Testing the backend without the frontend

With `npx wrangler dev` running:

**Windows PowerShell**
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8787 -ContentType "application/json" `
  -Body '{"messages":[{"role":"user","content":"How many moles are in 36 g of water? Just tell me."}]}'
```

**macOS / Linux / Git Bash**
```bash
curl -X POST http://localhost:8787 -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"How many moles are in 36 g of water? Just tell me."}]}'
```

---

## API

`POST http://localhost:8787`

Request: the full conversation, oldest first. The last message must be the student's new message.
```json
{
  "messages": [
    { "role": "user", "content": "How many moles are in 36 g of water?" },
    { "role": "assistant", "content": "What do you need to know about water to turn grams into moles?" },
    { "role": "user", "content": "The molar mass?" }
  ]
}
```

Response:
```json
{ "reply": "...", "rewritten": false, "model": "@cf/meta/llama-3.1-8b-instruct-fp8-fast" }
```

Errors return `{ "error": "..." }`: status `400` for a bad request, `500` if `.dev.vars` is missing values, `502` if Workers AI fails. Error messages never include the token.

---

## Try a different model

Edit `COACH_MODEL` in `wrangler.jsonc`, save, and `wrangler dev` reloads automatically:

```jsonc
"vars": {
  "COACH_MODEL": "@cf/mistralai/mistral-small-3.1-24b-instruct"
}
```

Model names are listed at <https://developers.cloudflare.com/workers-ai/models/>. Skip models marked as requiring a paid plan.

---

## Troubleshooting

The Coach page shows the backend's error message, and Terminal 1 logs more detail.

| Message | Fix |
|---|---|
| "Check that the backend is running" | Terminal 1 isn't running. Start `npx wrangler dev` in `gen-chem-mc` |
| "Missing WORKERS_AI_ACCOUNT_ID ... in gen-chem-mc/.dev.vars" | `.dev.vars` is missing, misnamed (e.g. `.dev.vars.txt`), in the wrong folder, or a value is blank. Fix it and restart `npx wrangler dev` |
| "Check that WORKERS_AI_TOKEN in .dev.vars is copied correctly" | The token has a space, line break, quote, or extra text. Copy it again as one unbroken string |
| "Workers AI rejected the token or account ID" | The token was revoked, belongs to a different account than the account ID, or lacks Workers AI permissions. Ask the token owner to check |
| "Workers AI could not find that account or model" | Check `WORKERS_AI_ACCOUNT_ID`, and that `COACH_MODEL` is spelled exactly as on the models page |
| "The free daily Workers AI allowance is used up" | Wait for the reset at 00:00 UTC (7 PM Central in daylight saving time, 6 PM in winter) |
| "Could not reach Cloudflare Workers AI" | Check your internet connection |
| `wrangler dev` asks you to log in, or reports an authentication error | An old `CLOUDFLARE_API_TOKEN` is set in your terminal. Close it, open a new terminal, and run `npx wrangler dev` again. You never need `wrangler login` for this branch |
| `wrangler` is not recognized | Run `npm install` first, and always use `npx wrangler` |
| Browser console shows a CORS error | Open the app at `http://localhost:5173` exactly. The Worker only accepts requests from that address |
| Port 8787 is in use | Stop the other `wrangler dev`, or run `npx wrangler dev --port 8788` and create `.env.local` with `VITE_COACH_URL=http://localhost:8788`, then restart `npm run dev` |

After editing `.dev.vars`, always restart `npx wrangler dev` (Ctrl+C, then run it again) so it picks up the new values.

---

## Free usage limits

Cloudflare gives each account **10,000 Neurons per day** for free, shared across all models and reset at 00:00 UTC. On the free plan you can't be charged; requests just fail until the reset. Everyone using the same token shares one account's allowance. With the answer check, expect a few hundred test messages per day in total with Llama 3.1 8B.