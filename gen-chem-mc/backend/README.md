# Coach Backend: Llama 3.1 8B

This branch connects the **Coach** page to a study-coach chatbot running Llama 3.1 8B.

The coach **never gives answers**, not even facts or definitions. It only guides students with questions and hints so they work things out themselves.

The model can run in either of two places:

| | **On your computer (Ollama)** (recommended) | **On Cloudflare** |
|---|---|---|
| Needs | Ollama installed, about 8 GB of free RAM | A run-only Cloudflare API token |
| Account or token | None | Your own, or one shared by a teammate |
| Cost | Free, no daily limit | Free daily allowance, shared by everyone using the token |
| Speed | Depends on your computer | Usually fast |

All commands below run from `Gen-Chem-MC/gen-chem-mc` unless noted.

## Quick start (on your computer)

1. Install [Ollama](https://ollama.com/download), then run `ollama pull llama3.1:8b`
2. Get the latest branch and install: `git fetch`, `git switch feature/chatbot-llama`, `git pull`, `npm install`
3. Create `.dev.vars`: `Copy-Item .dev.vars.example .dev.vars` (it's already set up for Ollama)
4. Run `npx wrangler dev` in one terminal and `npm run dev` in another
5. Open <http://localhost:5173/coach>

---

## What this branch adds

| File | Purpose |
|---|---|
| `backend/model.ts` | The backend: coach rules, model call (Ollama or Cloudflare), and the answer check |
| `wrangler.jsonc` | Backend config, including which model to use |
| `.dev.vars.example` | Template for your private `.dev.vars` settings file |
| `src/pages/Coach.tsx` | Coach page sends the conversation to the backend and shows replies |
| `package.json` | Adds `wrangler`, which runs the backend locally |
| `.gitignore` | Keeps `.dev.vars` and `.wrangler` out of git |

### How the coach avoids giving answers

1. **System prompt**: the coach's rules, sent with every conversation.
2. **Reminder**: a short "don't give the answer" rule attached to each student message before it reaches the model. Small models follow rules better when they sit right next to the question. Students never see it.
3. **Answer check**: a second model call reviews each reply. If it gives away the answer, the model rewrites it once. If the rewrite still leaks, a safe fallback question is shown instead.

Each student message therefore uses 2 to 4 model calls.

---

## Setup (one time)

You need **Git** and **Node.js 20.19 or newer**. See the main project README for installation.

1. **Get the latest branch**
   ```bash
   git fetch
   git switch feature/chatbot-llama
   git pull
   ```
   Run `git pull` even if you switched to this branch before. Older versions of the branch needed a Cloudflare login.

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Ollama and download the model**

   Download and install Ollama from <https://ollama.com/download>. On Windows and macOS it then runs in the background (look for the llama icon in the taskbar or menu bar).

   In a terminal:
   ```bash
   ollama pull llama3.1:8b
   ollama list
   ```
   The download is several GB and only happens once. `ollama list` should show `llama3.1:8b`.

4. **Create your `.dev.vars` file**

   Windows PowerShell:
   ```powershell
   Copy-Item .dev.vars.example .dev.vars
   ```
   macOS / Linux:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   The template is already set up to use Ollama on your computer:
   ```
   OLLAMA_URL=http://127.0.0.1:11434
   ```
   `.dev.vars` must sit in `gen-chem-mc`, next to `wrangler.jsonc`, **not** inside `backend`.

5. **Confirm git ignores it**
   ```bash
   git check-ignore .dev.vars
   ```
   It should print `.dev.vars`.

---

## Run it

Make sure Ollama is running, then open **two terminals**, both in `gen-chem-mc`.

**Terminal 1: the backend**
```bash
npx wrangler dev
```
Check that it prints `Using secrets defined in .dev.vars` and then `Ready on http://127.0.0.1:8787`. Leave it running.

**Terminal 2: the frontend**
```bash
npm run dev
```

Open <http://localhost:5173/coach> and send a message. When it works, Terminal 1 logs `POST / 200 OK` and the coach replies with a guiding question. The first message can take longer while Ollama loads the model into memory.

Open the app at port **5173**, not 8787. Visiting `localhost:8787` in the browser only shows `"Send a POST request..."` and logs `GET / 405 Method Not Allowed`, which is expected.

Stop either one with **Ctrl+C**.

---

## Using Cloudflare instead of Ollama

Use this if your computer is too slow for Ollama or doesn't have enough memory. In `.dev.vars`, delete the `OLLAMA_URL` line and add:

```
WORKERS_AI_ACCOUNT_ID=your_account_id
WORKERS_AI_TOKEN=your_run_only_token
```

Keep each on one line, with no spaces around `=` and no quotes. Restart `npx wrangler dev` afterwards. You don't need `wrangler login` either way.

### Getting a run-only token

Create your own (free), or ask a teammate who has one to send theirs by direct message.

1. In the [Cloudflare dashboard](https://dash.cloudflare.com), go to **Workers AI** and select **Use REST API**.
2. Click **Create a Workers AI API Token**, keep the prefilled permissions, and click **Create API Token**.
3. **Copy the token right away.** Cloudflare only shows it once.
4. On the same page, copy the **Account ID**.

The token should have only **Workers AI Read** and **Workers AI Edit**. On a Workers AI token, "Edit" means permission to **run** models. Don't add **Workers Scripts** or other permissions, which would let the holder change Workers on the account.

| The token can | The token can't |
|---|---|
| Run Workers AI models | Change, deploy, or delete Workers |
| List available models | Change account settings, billing, or DNS |
| Use the owner's free daily allowance | Change the coach's code (that only changes through git) |

**Keep it private.** Never put a token in GitHub, a group chat, a document, or any file other than `.dev.vars`. If one leaks, go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens), open its **⋯** menu, and choose **Roll** or **Delete**.

Cloudflare gives each account **10,000 Neurons per day** for free, shared across all models and reset at 00:00 UTC. On the free plan you can't be charged; requests just fail until the reset.

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

Request: the full conversation, oldest first. The last message must be the student's new message. Conversations can be any length; only the most recent 20 messages are sent to the model.
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
{ "reply": "...", "rewritten": false, "model": "llama3.1:8b" }
```

Errors return `{ "error": "..." }`: status `400` for a bad request, `500` if `.dev.vars` is missing settings, `502` if the model fails. Error messages never include a token.

---

## Try a different model

Change the model name in `wrangler.jsonc` and save; `wrangler dev` reloads automatically.

- **Ollama:** download the model first (for example `ollama pull qwen2.5:3b`), then set `"OLLAMA_MODEL": "qwen2.5:3b"`. Browse models at <https://ollama.com/library>.
- **Cloudflare:** set `COACH_MODEL`, for example `"@cf/mistralai/mistral-small-3.1-24b-instruct"`. Browse models at <https://developers.cloudflare.com/workers-ai/models/> and skip ones that require a paid plan.

---

## Troubleshooting

The Coach page shows the backend's error message, and Terminal 1 logs more detail.

| Message | Fix |
|---|---|
| "Check that the backend is running" | Terminal 1 isn't running. Start `npx wrangler dev` in `gen-chem-mc` |
| "Missing settings in gen-chem-mc/.dev.vars" | `.dev.vars` is missing, misnamed (e.g. `.dev.vars.txt`), in the wrong folder, or empty. Fix it and restart `npx wrangler dev` |
| "Could not reach Ollama" | Start the Ollama app, and check that `OLLAMA_URL` in `.dev.vars` is `http://127.0.0.1:11434` |
| "Ollama doesn't have ... yet" | Run the `ollama pull` command shown in the message, or fix `OLLAMA_MODEL` in `wrangler.jsonc` |
| Replies take a very long time | Your computer is slow for this model. Close other apps, try a smaller model such as `qwen2.5:3b`, or switch to Cloudflare |
| "Check that WORKERS_AI_TOKEN in .dev.vars is copied correctly" | The token has a space, line break, quote, or extra text. Copy it again as one unbroken string |
| "Workers AI rejected the token or account ID" | The token was revoked, belongs to a different account than the account ID, or lacks Workers AI permissions |
| "Workers AI could not find that account or model" | Check `WORKERS_AI_ACCOUNT_ID`, and that `COACH_MODEL` is spelled exactly as on the models page |
| "The free daily Workers AI allowance is used up" | Wait for the reset at 00:00 UTC (7 PM Central in daylight saving time, 6 PM in winter), or switch to Ollama |
| `wrangler dev` asks you to log in or for an API token | You have an old version of the branch: run `git pull`. If it still asks, an old `CLOUDFLARE_API_TOKEN` is set in your terminal; open a new terminal and try again |
| `wrangler` is not recognized | Run `npm install` first, and always use `npx wrangler` |
| Browser console shows a CORS error | Open the app at `http://localhost:5173` exactly. The backend only accepts requests from that address |
| Port 8787 is in use | Stop the other `wrangler dev`, or run `npx wrangler dev --port 8788` and create `.env.local` with `VITE_COACH_URL=http://localhost:8788`, then restart `npm run dev` |

After editing `.dev.vars`, restart `npx wrangler dev` (Ctrl+C, then run it again) so it picks up the change.