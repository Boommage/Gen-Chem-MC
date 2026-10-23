# GET CHEM — Frontier Metacognitive Tutor Testing Guide

This branch contains **Frontier**, an experimental AI tutor developed for GET CHEM.

The goal of Frontier is to help General Chemistry students develop their problem-solving and metacognitive skills through guided questions, hints, and feedback rather than simply giving them answers.

Frontier is the name of our tutoring experiment, not the name of the underlying language model. Our current implementation uses **Google's Gemini API**, but we may explore other language models as the project develops.

**Branch:** `experiment/frontier-metacognitive-tutor`
**Current LLM Provider:** Google Gemini
**Status:** Experimental prototype — local testing

---

## 1. Prerequisites

Before getting started, make sure you have:

- **Git** — to clone the project from GitHub.
- **Node.js and npm** — use a recent Node.js LTS release compatible with the project's Vite version.
- **A code editor** — VS Code is recommended.
- **A Gemini API key** — available through [Google AI Studio](https://aistudio.google.com/apikey).
- **A terminal** — Terminal on macOS/Linux or PowerShell on Windows.

Each team member should create their own Gemini API key. This allows us to test Frontier independently without sharing one person's API credentials or usage limits.

**Important:** Never commit API keys to GitHub, include them in screenshots, or share them in team messages.

## 2. Clone the Repository

If you have not downloaded GET CHEM before, open your terminal and run:

```bash
git clone https://github.com/Boommage/Gen-Chem-MC.git
cd Gen-Chem-MC
git switch experiment/frontier-metacognitive-tutor
cd gen-chem-mc
```

These commands download the project, switch to the Frontier experimental branch, and enter the application directory.

### If you already have the repository

Open your existing GET CHEM repository and run:

```bash
git fetch origin
git switch --track origin/experiment/frontier-metacognitive-tutor
cd gen-chem-mc
```

If you already have the experimental branch locally, use:

```bash
git switch experiment/frontier-metacognitive-tutor
```

Make sure you save or commit any unrelated local changes before switching branches.

## 3. Install Dependencies

Inside the `gen-chem-mc` directory, run:

```bash
npm ci
```

This installs the project dependencies using the committed lockfile, including the Google Gemini SDK.

You only need to repeat this when dependencies change or you reinstall the project.

## 4. Create Your Gemini API Key

Frontier currently uses Google's Gemini model to generate tutoring responses.

To create your own API key:

1. Visit [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in using your Google account.
3. Create an API key in a project available to you.
4. Copy your new API key.
5. Keep it private.

Google may apply free-tier quotas, eligibility requirements, or billing restrictions depending on the account and model.

### Configure your API key

**For macOS/Linux:**

In the terminal where you plan to start Frontier, run:

```bash
export GEMINI_API_KEY="YOUR_API_KEY"
```

**For Windows PowerShell:**

```powershell
$env:GEMINI_API_KEY="YOUR_API_KEY"
```

Replace `YOUR_API_KEY` with your own Gemini API key.

This environment variable applies to the current terminal session. If you open a new terminal later, you may need to configure it again.

### Verify your configuration

**macOS/Linux:**

```bash
test -n "$GEMINI_API_KEY" && echo "KEY_CONFIGURED" || echo "KEY_MISSING"
```

**Windows PowerShell:**

```powershell
if ($env:GEMINI_API_KEY) { "KEY_CONFIGURED" } else { "KEY_MISSING" }
```

You should see:

```text
KEY_CONFIGURED
```

This confirms that the variable is set, but does not verify whether Google accepts the key.

**Security reminder:** Do not print your actual API key into screenshots, terminal logs shared with others, or GitHub issues.

## 5. Start the Frontier Tutor

Make sure you are inside the `gen-chem-mc` directory.

In the same terminal where you configured your API key, run:

```bash
node backend/frontier-server.mjs
```

Expected output:

```text
GET CHEM Gemini tutor running at http://127.0.0.1:8788
```

This means the Frontier backend is running locally and listening for requests.

**Keep this terminal open while testing.**

The local server runs at:

`http://127.0.0.1:8788`

This address refers to your own computer. Other team members will run their own local copies of Frontier.

To stop the server, press **Control + C**.

## 6. Test Frontier

For now, we are testing Frontier directly through the backend API. The Gemini-powered tutor has not yet been connected to the React Coach interface.

Open a **second terminal** while keeping the first terminal running.

### Test 1: Direct answer request

Run this command:

```bash
curl -sS http://127.0.0.1:8788/ -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"What is the molarity of 2 moles of NaCl in 0.5 liters? Just give me the answer."}]}'
```

**Expected behavior:**

Frontier should not immediately reveal the final answer. Instead, it should encourage the student to recall the formula for molarity or think through the calculation.

For example, Frontier might respond:

> What formula would you use to calculate molarity?

The exact wording may vary because language model responses are not always identical.

### Test 2: Student needs help

```bash
curl -sS http://127.0.0.1:8788/ -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"I am trying to calculate molarity, but I do not know where to start. Can you help me?"}]}'
```

**Expected behavior:**

Frontier should provide a helpful starting point without completing the entire problem for the student.

### Test 3: Incorrect reasoning

```bash
curl -sS http://127.0.0.1:8788/ -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"I think molarity is liters divided by moles. Is that correct?"}]}'
```

**Expected behavior:**

Frontier should recognize the misconception and guide the student toward the correct relationship.

### Test 4: Student provides the correct reasoning

```bash
curl -sS http://127.0.0.1:8788/ -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"What is the molarity of 2 moles of NaCl in 0.5 liters?"},{"role":"assistant","content":"What formula would you use to calculate molarity?"},{"role":"user","content":"Molarity is moles divided by liters, so 2 divided by 0.5 gives me 4 M. Is that correct?"}]}'
```

**Expected behavior:**

Frontier should recognize the student's reasoning and respond appropriately.

However, this version does not yet have an independent answer-verification system. We should not treat the language model's agreement as proof that an answer has been checked.

### Important note about conversations

Frontier currently receives a list of conversation messages in the `messages` field.

For multi-turn tests, include previous student and tutor messages in the request, as demonstrated in Test 4.

The server does not currently maintain a persistent conversation history between separate requests.

## 7. What We Want to Test

Our goal is not simply to see whether Frontier can answer chemistry questions. We want to evaluate **how well it helps students think through problems independently**.

Use the following scenarios during testing:

| Scenario | Example | Expected behavior |
|---|---|---|
| Direct answer request | "Just give me the answer." | Guides the student instead |
| Student is confused | "I don't know where to start." | Provides a helpful hint |
| Incorrect reasoning | "Molarity means liters divided by moles." | Identifies the misconception |
| Correct reasoning | "2 divided by 0.5 equals 4 M." | Responds appropriately without claiming independent verification |
| Repeated pressure | "Stop asking questions and tell me." | Maintains tutoring boundaries |
| Student needs another hint | "I still don't understand." | Provides additional scaffolding |
| Different chemistry topics | Stoichiometry, bonding, equilibrium | Gives accurate, topic-appropriate guidance |
| Unrelated homework request | "Complete all my homework for me." | Redirects toward learning |

When testing, pay particular attention to whether Frontier:

- Encourages students to explain their thinking.
- Asks relevant questions instead of repeating generic prompts.
- Recognizes misconceptions.
- Gives useful hints when students struggle.
- Avoids revealing final answers prematurely.
- Responds appropriately when students demonstrate understanding.
- Maintains scientifically accurate explanations.

## 8. Record Your Testing Results

We want everyone on the team to document their observations so we can compare results and identify areas for improvement.

For each test, record:

- The chemistry topic or problem.
- The exact prompt sent to Frontier.
- The response Frontier generated.
- Whether Frontier revealed the final answer prematurely.
- Whether its chemistry guidance was accurate.
- Whether the response helped the student make progress.
- Any errors, confusing behavior, or suggestions.

### Example testing record

| Field | Example |
|---|---|
| Test ID | FT-001 |
| Topic | Molarity |
| Student prompt | "Just give me the answer." |
| Expected behavior | Ask a guiding question |
| Actual behavior | Asked for the molarity formula |
| Result | Pass |
| Notes | Did not reveal the answer |

You can report bugs and suggestions through the team's GitHub repository.

Please do not include real students' personal information, private conversations, or API credentials in test reports.

## 9. Troubleshooting

### Connection refused

Example:

```text
curl: (7) Failed to connect to 127.0.0.1 port 8788
```

**Solution:** Make sure the Frontier backend is running in another terminal.

### Missing Gemini API key

Example:

```text
GEMINI_API_KEY is missing
```

**Solution:** Configure the environment variable in the same terminal where you start the server.

### Model unavailable — HTTP 404

A model name may become unavailable or may not be accessible to your Google AI Studio project.

**Solution:** Check the model configured in `backend/frontier-server.mjs` or through the `TUTOR_MODEL` environment variable.

For example, the current experiment uses the model identifier:

```text
gemini-3.8-flash
```

Model availability may change. Check Google's current model documentation if this identifier stops working.

### Quota or rate limit — HTTP 429

You may have reached your available API quota.

**Solution:** Check your Google AI Studio usage limits and whether your account has access to the selected model.

### Port already in use

Example:

```text
EADDRINUSE
```

Another process may already be using port 8788.

**Solution:** Check whether Frontier is already running in another terminal before starting a second instance.

### Unable to get a response from Gemini

Example:

```json
{"error":"Unable to get a response from Gemini."}
```

This is a generic backend error.

**Solution:** Look at the terminal running `frontier-server.mjs` for the detailed error message. It may indicate a model, authentication, quota, or connectivity problem.

Remove credentials from any error logs before sharing them.

## 10. Current Limitations

Frontier is an experimental prototype and is not yet ready for production use.

Current limitations include:

- **No Coach interface integration yet:** Testing currently happens through terminal commands.
- **No independent answer checker:** The model cannot yet provide independently verified correctness decisions.
- **Possible answer leakage:** A language model may sometimes reveal an answer even when instructed not to.
- **Possible reasoning errors:** Frontier may misunderstand student responses or provide incorrect chemistry explanations.
- **No persistent conversation storage:** Previous messages must be included in each API request.
- **API access requirements:** Each tester needs a Gemini API key, and quotas or billing requirements may vary.
- **Local testing only:** The backend currently runs on each tester's own computer.

Only use synthetic chemistry problems and test conversations at this stage. Do not submit real student data.

## 11. What Comes Next?

Once we have tested Frontier's behavior, our next development goals are:

1. **Integrate Frontier into the GET CHEM Coach interface**, allowing students and testers to interact through the web application rather than terminal commands.
2. **Develop a trusted answer-verification system** to check student solutions independently of the language model.
3. **Expand testing across General Chemistry topics**, including different difficulty levels and misconceptions.
4. **Compare tutoring behavior across models** to determine which approach best supports our educational goals.
5. **Improve the tutoring prompts and evaluation process** using feedback from our team.

Our long-term goal is to build an AI tutor that does more than know chemistry. We want a system that helps students become more confident, independent, and thoughtful problem-solvers.

---

**GET CHEM — Frontier Metacognitive Tutor**

*Experimental implementation for team development, testing, and evaluation.*
