
# GET CHEM — Frontier Metacognitive Tutor Testing Guide

Frontier is an experimental AI chemistry tutor developed for the GET CHEM project.

Our goal is to help General Chemistry students become better problem-solvers by encouraging them to explain their thinking, recognize mistakes, reflect on their understanding, and learn through guided questions and feedback.

Frontier is the name of our tutoring experiment, not the underlying language model. The current implementation uses Google's Gemini API.

**Branch:** `experiment/frontier-metacognitive-tutor`  
**LLM Provider:** Google Gemini  
**Model used in successful initial tests:** `gemini-3.5-flash-lite`  
**Status:** Experimental prototype — local testing

This guide explains how to install Frontier, start the backend, chat with the tutor through Terminal, and document testing results.

---

## 1. Prerequisites

Before getting started, make sure you have:

- **Git** — to clone the project.
- **Node.js and npm** — use a recent Node.js LTS version compatible with the project.
- **Python 3** — to run the interactive chat.
- **A code editor** — VS Code is recommended.
- **A Gemini API key** — available through [Google AI Studio](https://aistudio.google.com/apikey).
- **A terminal** — Terminal on macOS/Linux or PowerShell on Windows.

Each team member should use their own Gemini API key so that we can test independently.

**Important:** Never commit API keys to GitHub, include them in screenshots, or share them in team messages.

---

## 2. Clone the Repository

### If this is your first time downloading GET CHEM

Open Terminal and run:

```bash
git clone https://github.com/Boommage/Gen-Chem-MC.git
cd Gen-Chem-MC
git switch experiment/frontier-metacognitive-tutor
cd gen-chem-mc
```

This downloads the repository, switches to the experimental Frontier branch, and enters the application directory.

### If you already have the repository

Navigate to your existing repository:

```bash
cd ~/Gen-Chem-MC
git fetch origin
```

If you already have the experimental branch locally:

```bash
git switch experiment/frontier-metacognitive-tutor
git pull --ff-only
cd gen-chem-mc
```

If you do not have the experimental branch locally:

```bash
git switch --track origin/experiment/frontier-metacognitive-tutor
cd gen-chem-mc
```

Save or commit unrelated local changes before switching branches.

---

## 3. Install Dependencies

Inside the `gen-chem-mc` directory, run:

```bash
npm ci
```

This installs the project dependencies using the committed lockfile, including the Gemini SDK.

The interactive Python chat uses Python's standard library, so no additional Python packages are required.

You generally only need to repeat `npm ci` when dependencies change or you reinstall the project.

---

## 4. Create and Configure Your Gemini API Key

Frontier currently uses Google's Gemini API to generate tutoring responses.

### Create an API key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with your Google account.
3. Create an API key in a project available to you.
4. Copy the key.
5. Keep it private.

Google may apply usage quotas, eligibility requirements, or billing restrictions depending on your account and the model.

### Configure the key on macOS/Linux

In the Terminal where you plan to start Frontier, run:

```bash
export GEMINI_API_KEY="YOUR_API_KEY"
```

Replace `YOUR_API_KEY` with your actual key.

### Configure the key on Windows PowerShell

```powershell
$env:GEMINI_API_KEY="YOUR_API_KEY"
```

### Verify that the key is configured

For macOS/Linux:

```bash
test -n "$GEMINI_API_KEY" && echo "KEY_CONFIGURED" || echo "KEY_MISSING"
```

For Windows PowerShell:

```powershell
if ($env:GEMINI_API_KEY) { "KEY_CONFIGURED" } else { "KEY_MISSING" }
```

Expected output:

```text
KEY_CONFIGURED
```

This only confirms that the environment variable exists. It does not confirm whether Google accepts the key.

**Security reminder:** Do not print your actual API key into screenshots, shared terminal logs, or GitHub issues.

Environment variables set this way apply to the current Terminal session. You may need to configure the key again when opening a new session.

---

## 5. Start the Frontier Backend

Frontier currently runs as a local Node.js backend.

We recommend using **two Terminal windows**:

- **Terminal 1:** Runs the Frontier backend.
- **Terminal 2:** Runs the interactive Python chat.

### Terminal 1 — Start the server

Make sure you are inside the `gen-chem-mc` directory.

For macOS/Linux:

```bash
TUTOR_MODEL=gemini-3.5-flash-lite node backend/frontier-server.mjs
```

For Windows PowerShell:

```powershell
$env:TUTOR_MODEL="gemini-3.5-flash-lite"
node backend/frontier-server.mjs
```

We explicitly select `gemini-3.5-flash-lite` because it worked during our initial testing. Other model identifiers previously produced availability errors.

Expected output should indicate that the server is listening at:

```text
http://127.0.0.1:8788
```

The server is now running locally.

**Keep this Terminal window open while testing.**

Do not press Control + C until you are finished.

The address `127.0.0.1` refers to your own computer. Other team members will run their own local copies.

---

## 6. Chat With Frontier Through Terminal (Recommended)

Previously, testing Frontier required writing a full `curl` command every time we wanted to send a prompt.

We now have a simpler interactive chat interface using Python.

This allows team members to type chemistry questions directly into Terminal and receive Frontier's responses.

It also maintains the conversation history during the current session, which helps us test how Frontier responds across multiple messages.

### Terminal 2 — Start the interactive chat

Open a second Terminal window.

Navigate to the application directory.

For macOS/Linux:

```bash
cd ~/Gen-Chem-MC/gen-chem-mc
python3 frontier-chat.py
```

For Windows PowerShell, navigate to your cloned `gen-chem-mc` directory and run:

```powershell
python frontier-chat.py
```

If your Windows installation uses the Python launcher, use `py frontier-chat.py` instead.

You should see:

```text
🧪 GET CHEM — Frontier Tutor
Type your chemistry questions below.
Commands: /reset to start over, /exit to quit.

You:
```

Now you can type a chemistry question.

For example:

```text
You: What is molarity?

Frontier: [Model-generated response]

You: I don't understand. Can you give me an example?

Frontier: [Model-generated response]

You: What if I have 2 moles in 0.5 liters?

Frontier: [Model-generated response]
```

The actual responses will vary because they are generated by the language model.

### Available chat commands

| Command | What it does |
|---|---|
| Type a question | Sends your message to Frontier |
| `/reset` | Clears the conversation history |
| `/exit` | Exits the chat |
| `/quit` | Exits the chat |
| Control + C | Stops the running program |

### Why conversation history matters

Suppose a student first says:

> Molarity is moles divided by liters.

Later, the student says:

> So I should divide liters by moles, right?

Frontier should recognize that the second statement contradicts the first.

The interactive Python script sends earlier messages with each new request, allowing Frontier to use that context.

However, the conversation history is currently stored only in the running Python script.

If you exit or reset the chat, that history is lost.

The backend does not independently store previous conversations.

### Starting a new test

Use:

```text
/reset
```

This is important when conducting separate experiments.

For example, if you finish testing an incorrect molarity calculation and want to test chemical bonding, reset the conversation first so earlier messages do not affect the new test.

---

## 7. Optional: Testing the Backend Directly With curl

The interactive chat is the easiest option for normal testing.

However, `curl` is still useful when we want to submit an exact request, reproduce a specific test, or simulate a conversation with predetermined messages.

Keep the backend running in Terminal 1.

Open another Terminal and run:

```bash
curl -sS http://127.0.0.1:8788/ \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What is the molarity of 2 moles of NaCl in 0.5 liters? Just give me the answer."}]}'
```

The backend returns a JSON response containing Frontier's message.

### Example: Testing conversation history

```bash
curl -sS http://127.0.0.1:8788/ \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What is the molarity of 2 moles of NaCl in 0.5 liters?"},{"role":"assistant","content":"What formula would you use to calculate molarity?"},{"role":"user","content":"Molarity is moles divided by liters, so 2 divided by 0.5 gives me 4 M. Is that correct?"}]}'
```

The `messages` array includes the conversation history.

**Important:** In this example, the previous assistant message is supplied manually for testing. It is not necessarily a response that Frontier generated during a live conversation.

The backend does not currently maintain a persistent conversation history between separate API requests.

---

## 8. What We Want to Test

Our goal is not simply to see whether Frontier knows chemistry.

We want to evaluate **how well it helps students think independently and develop confidence in their reasoning**.

Use the following scenarios during testing:

| Scenario | Example | What we want to observe |
|---|---|---|
| Direct answer request | "Just give me the answer." | Encourages reasoning instead of immediately solving |
| Student confusion | "I don't know where to start." | Provides a helpful explanation or hint |
| Incorrect reasoning | "Molarity is liters divided by moles." | Identifies and addresses the misconception |
| Correct reasoning | "2 divided by 0.5 equals 4 M." | Recognizes understanding and provides meaningful feedback |
| Repeated pressure | "Stop asking questions and tell me." | Maintains appropriate tutoring behavior |
| Student needs another hint | "I still don't understand." | Adjusts its explanation |
| Contradictory reasoning | Student reverses an earlier correct definition | Notices the inconsistency |
| Full solution verification | Student provides all calculations | Checks each step and explains the result |
| Hidden arithmetic mistake | Student makes a confident calculation error | Detects the error rather than agreeing |
| Different chemistry topics | Bonding, stoichiometry, equilibrium | Gives accurate, topic-appropriate guidance |
| Unrelated homework request | "Complete all my homework for me." | Redirects toward learning |

### Questions to consider during testing

- Does Frontier encourage students to explain their thinking?
- Does it recognize misconceptions?
- Does it ask relevant questions instead of repeating generic prompts?
- Does it adjust when a student is struggling?
- Does it acknowledge correct reasoning?
- Can it identify errors in calculations?
- Does it provide useful feedback when a student completes a problem?
- Does it use earlier conversation history appropriately?
- Are its chemistry explanations scientifically accurate?
- Does it know when to stop asking questions and provide confirmation?

We want Frontier to be a useful tutor, not simply a chatbot that repeatedly asks students questions.

---

## 9. Initial Testing Results

We conducted an initial series of manual tests, labeled FT-000 through FT-008.

The tests covered basic tutoring, incorrect reasoning, prompt manipulation, student frustration, conceptual misconceptions, conversation history, and verification of completed work.

### Summary

| Test ID | Area Tested | Initial Observation |
|---|---|---|
| FT-000 | Basic tutoring | Pass |
| FT-001 | Developer impersonation | Pass |
| FT-002 | Incorrect reasoning | Pass |
| FT-003 | Student confusion | Pass |
| FT-004 | Indirect answer checking | Pass, with concern |
| FT-005 | Correct reasoning | Pass |
| FT-006 | Conceptual misconception | Pass |
| FT-007 | Contradictory reasoning | Pass |
| FT-008 | Full solution verification | Partial pass |

These are informal evaluations of individual responses, not statistically validated performance measurements.

### Important finding from FT-008

In FT-008, we gave Frontier a fully worked and correct molarity solution.

The student converted:

- 5.85 grams of NaCl into approximately 0.1001 moles.
- 500 mL into 0.500 L.
- 0.1001 mol divided by 0.500 L into approximately 0.200 M.

The student explicitly asked Frontier to verify every step.

Frontier acknowledged the first calculation but did not complete the verification.

Instead, it asked another question about why dividing grams by molar mass produces moles.

This suggests that Frontier may prioritize Socratic questioning even when the student has already demonstrated understanding and is asking for meaningful feedback.

**Our next goal is to improve this balance.**

Frontier should encourage independent reasoning, but it should also recognize when students need confirmation of correct work.

### Full testing report

For the exact prompts, model responses, and our observations, see:

[FRONTIER-TEST-RESULTS.md](FRONTIER-TEST-RESULTS.md)

This file contains the detailed record of our initial tests.

---

## 10. How to Record New Testing Results

Everyone on the team should document important observations so we can compare results and identify areas for improvement.

For each test, record:

1. Test ID.
2. Chemistry topic.
3. Exact student prompt.
4. Actual response generated by Frontier.
5. Expected behavior.
6. Our observation.
7. Result: Pass, Partial Pass, or Fail.
8. Model used, if known.

### Example test record

**Test ID:** FT-009

**Topic:** Molarity

**Student prompt:**

> I calculated 0.1001 / 0.500 = 0.0200 M. Is my answer correct?

**Expected behavior:**

Frontier should recognize that the division is incorrect. The correct result is approximately 0.200 M.

**Actual response:**

To be filled in after running the test.

**Our observation:**

To be filled in after evaluating Frontier's response.

**Result:**

Not yet tested.

### Important testing practices

- Use `/reset` before starting an independent test in the interactive chat.
- Copy Frontier's actual response rather than rewriting it as if the model said something different.
- Separate the model's response from our own interpretation.
- Record failures and confusing behavior, not just successful responses.
- Avoid claiming that a single successful response proves the model is reliable.
- Do not include API keys, real students' private conversations, or personal information.

Team members can report issues and suggestions through the GitHub repository.

---

## 11. Troubleshooting

### Connection refused

Example:

```text
Request failed: <urlopen error [Errno 61] Connection refused>
```

Or:

```text
curl: (7) Failed to connect to 127.0.0.1 port 8788
```

**Cause:** The Frontier backend is probably not running or is not listening on port 8788.

**Solution:**

Open a separate Terminal window and run:

```bash
cd ~/Gen-Chem-MC/gen-chem-mc
TUTOR_MODEL=gemini-3.5-flash-lite node backend/frontier-server.mjs
```

Make sure your API key is configured in that Terminal.

Keep the server running and return to your chat window.

### Missing Gemini API key

Example:

```text
GEMINI_API_KEY is missing
```

**Solution:**

Configure your API key in the same Terminal where you start the backend.

For macOS/Linux:

```bash
export GEMINI_API_KEY="YOUR_API_KEY"
```

Then restart the server.

### Model unavailable — HTTP 404

A model identifier may be unavailable or inaccessible to your Google AI Studio project.

During initial testing, some model selections returned HTTP 404 errors.

**Solution:**

Use the model that worked in our initial tests:

```bash
TUTOR_MODEL=gemini-3.5-flash-lite node backend/frontier-server.mjs
```

Model availability can change, so check Google's current model documentation if necessary.

### High demand — HTTP 503

During testing, we encountered a 503 error indicating that the model was experiencing high demand.

**Solution:**

Wait briefly and retry the request, or use another model that is available to your account.

The current prototype does not yet provide automatic retry handling.

### Quota or rate limit — HTTP 429

You may have reached your API usage quota.

**Solution:**

Check Google AI Studio usage limits and whether your account has access to the selected model.

### Port already in use

Example:

```text
EADDRINUSE
```

Another process may already be using port 8788.

**Solution:**

Check whether Frontier is already running in another Terminal before starting a second server.

### Unable to get a response from Gemini

Example:

```json
{"error":"Unable to get a response from Gemini."}
```

This is a generic backend error.

**Solution:**

Look at the Terminal running `frontier-server.mjs` for the detailed error message.

Possible causes include model availability, authentication, quotas, or connectivity.

Remove credentials before sharing error logs.

### Python chat script not found

Example:

```text
python3: can't open file 'frontier-chat.py'
```

**Solution:**

Make sure `frontier-chat.py` exists inside `gen-chem-mc` and that you are running the command from that directory.

### Chat does not remember earlier messages

The Python chat stores conversation history in memory during the current session.

Make sure you are using the interactive chat rather than sending separate `curl` requests.

Remember that `/reset` clears conversation history, and exiting the program ends the session.

---

## 12. Current Limitations

Frontier is still an experimental prototype and is not ready for production use.

Current limitations include:

- **No frontend integration yet:** Frontier is not yet connected to the GET CHEM Coach or Neocortex interface.
- **No independent answer checker:** Gemini generates responses without a separate trusted system verifying every calculation.
- **Incomplete feedback in some cases:** FT-008 showed that Frontier may ask additional questions instead of completing requested verification.
- **Possible answer leakage:** The model may sometimes reveal answers prematurely.
- **Possible reasoning errors:** Frontier may misunderstand student responses or provide incorrect chemistry explanations.
- **No persistent conversation storage:** The Python chat maintains history only during the current session.
- **API access requirements:** Each tester needs an API key, and usage limits may vary.
- **Local testing only:** The backend currently runs on each tester's computer.
- **Limited evaluation:** Initial tests have not yet established reliability across different topics, models, or repeated trials.

For now, use synthetic chemistry problems and test conversations. Do not submit real student data.

---

## 13. What Comes Next?

After our initial testing, the next development priorities are:

1. **Improve solution verification.** Frontier should provide meaningful feedback when a student has completed a problem correctly or incorrectly.

2. **Develop an independent answer checker.** We want to verify calculations separately from the language model whenever practical.

3. **Expand testing across General Chemistry topics.** This includes stoichiometry, bonding, equilibrium, and other topics.

4. **Automate repeatable tests.** We want to compare different prompt versions and models using consistent test cases.

5. **Integrate Frontier into the GET CHEM frontend.** This will allow students to interact through the Coach or Neocortex interface instead of Terminal.

6. **Improve the tutoring experience.** We want Frontier to balance asking questions, explaining concepts, giving hints, and recognizing student progress.

Our long-term goal is to build an AI tutor that does more than know chemistry.

We want a system that helps students become more confident, independent, and thoughtful problem-solvers.

---

**GET CHEM — Frontier Metacognitive Tutor**

*Experimental implementation for team development, testing, and evaluation.*
