# Napkin Round 0

## 1. Shape

Not a single shape — this is a **chatbot / tutoring interface** layered on top of a **data pipeline and analytics tracker**, with a light **integration** dependency on D2L.

- Socratic chemistry chatbot (guides problem decomposition, never gives the answer)
- Study-habit tracker (Pomodoro logging, study times/lengths/methods)
- Benchmark quiz (baseline of how a student already studies)
- D2L integration (pull grades/course content to train and personalize)
- Notification engine (per-class study reminders)

Core shape for MVP: **a web app with an LLM-backed chatbot, a small tracking database, and one external integration.**

## 2. The Hard Part

Making the chatbot **reliably refuse to give the direct answer** while still being genuinely useful for breaking a problem down — under adversarial student behavior (rephrasing the question, asking it to "just check my answer," asking for a "similar worked example" that's really the same problem). This is a prompt-engineering and guardrail problem, not a chemistry problem, and it's the entire value proposition of the app. If this fails, the app is just a worse version of ChatGPT.

## 3. Bottleneck

Two candidates, both real:

- **D2L access at scale.** The client can hand-provide course access to one professor's content, but pulling *grades* programmatically for many students means real D2L/LTI API credentials and FERPA-compliant data handling — something a class project team is unlikely to get access to or clear in one semester.
- **Guardrail bypass.** Because the "never give the answer" rule lives in a system prompt on top of a general-purpose LLM, it breaks the first time a student finds a phrasing that routes around it. This breaks under real usage, not under a demo.

## 4. Stack

Boring default: **web app (React/Next.js frontend) + a backend (Node or Python) + an LLM API with a constrained system prompt + a small relational database (Postgres/SQLite) for quiz results and study-session logs.** No custom model training needed at MVP — the "train the model on her lecture content" ask is really retrieval-augmented generation (feeding transcripts/notes into context), not fine-tuning. Reserve fine-tuning or a custom model for a stretch goal, not the baseline.

## 5. Kill Risks (mechanism, not category)

1. **D2L grade extraction stalls the project.** The client has no official D2L API access to offer — only YouTube lecture videos and D2L *course content* access. If "extract grades" is treated as a required MVP feature, the team burns weeks waiting on integration access that may never arrive, and nothing else ships.
2. **The chatbot leaks answers under normal paraphrasing.** A system-prompt-only guardrail ("don't give the answer") is not robust; a student typing "just tell me if 2.5 mol is right" or "give me a worked example with the same numbers" gets the answer anyway, and the app's core differentiator from existing AI tools silently disappears.
3. **Scope creep from the "BIG SCOPE" list.** Assignment tracker across all of a student's classes, cross-class notification sequencing, gamified leaderboards, and streaks are each their own feature with their own edge cases. Treating them as equal-priority to the core loop (benchmark quiz → guided chat → Pomodoro log) means the team ends the semester with five half-built features instead of one working one.

## 6. Verdict

MVP: benchmark quiz + Socratic chemistry chatbot (single course, provided lecture content only, no live grade pull) + manual Pomodoro logging with a simple usage summary.

