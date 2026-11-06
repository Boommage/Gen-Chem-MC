# Traceability Matrix

**Project:** Gen Chem Metacognition (Neocortex)\
**Team:** Team #4\
**Version:** 0.2 — Checkpoint 2 review draft\
**Evidence baseline:** `main` at `fe52c63`, reviewed November 6, 2026.

## 1. Feature to use case area

| Feature from [Vision and Scope](requirements/vision-and-scope.md) | Business objectives | Use case area and coverage |
|---|---|---|
| `FEAT-guided-chatbot` | `BO-problem-dissection`, `BO-freshman-transition` | CHAT: text/image Coach and in-view follow-ups are built; saved-chat resume is future. Coaching behavior verification is partial. |
| `FEAT-benchmark-quiz` | `BO-study-awareness`, `BO-freshman-transition` | BNCH: future required study-habits assessment. Merged design covers original submission; entry gate, resume, and defaults need review. |
| `FEAT-pomodoro-timer` | `BO-study-awareness`, `BO-freshman-transition` | TIMR: future timed session with before/after confidence. |
| `FEAT-study-session-log` | `BO-study-awareness` | TIMR/SLOG: future timed-session records and student summary. Manual entry is a gap. |
| `FEAT-account-consent` (candidate in published scope) | Enabling; research consent may support `BO-outcome-evidence` | ACCT: future student identity and account access only. No consent or grade integration is included. |
| `FEAT-course-grounding` | `BO-problem-dissection` | No row this checkpoint; scope gap below. |
| `FEAT-reflection` | `BO-self-reflection` | No row this checkpoint; scope gap below. |

The rest of the candidate/postponed features remain in the [published scope](requirements/vision-and-scope.md#43-mvp-scope). Adding a traceability row does not change that scope or imply client approval.

## 2. Business rule to enforcing behavior

| Rule | Source | Enforced or intended in |
|---|---|---|
| `BR-no-direct-answers` | [Client interview](meetings/client-interview-2026-09-08.md); [business rules](requirements/business-rules.md#21-tutoring-and-guidance-behavior) | `UC-CHAT-work-through-problem`, extension 4a; server prompt. Semantic enforcement and measured leak rate are not verified. |
| `BR-answer-confirmation-only` | Same | `UC-CHAT-work-through-problem`, extension 4a; server prompt requires student reasoning before confirming. |
| `BR-student-initiated-breakdown` | Same | `UC-CHAT-work-through-problem`, main flow and extension 4a; server prompt instructs the student to do the breakdown. |
| `BR-no-content-teaching` | Client project brief; [business rules](requirements/business-rules.md#21-tutoring-and-guidance-behavior) | `UC-CHAT-work-through-problem`, main flow and extension 4a; server prompt. |
| `BR-student-information-confidentiality` (candidate) | Team clarification, November 6; [business rules](requirements/business-rules.md#22-candidate-rules--not-yet-confirmed) | Future identity and access boundary; instructor view is unbuilt and not in this short use-case list. |
| `BR-leaderboard-professor-only` (candidate) | Team brainstorm; [business rules](requirements/business-rules.md#22-candidate-rules--not-yet-confirmed) | No implementation or committed use case. |

## 3. Functional traceability matrix

**Build** records code coverage of the stated scope. **Verify** is independent: a mocked transport or component test is evidence for that behavior, not evidence that Gemma always follows the coaching rules. **Later** is unscheduled future work; no release tag is invented here.

| Use case | Build | Verify | Release | Requirements | Design | Frontend | Backend | Tests and gaps |
|---|---|---|---|---|---|---|---|---|
| [`UC-ACCT-sign-in`](requirements/use-cases.md#uc-acct-sign-in-access-a-student-account) | ❌ Not started | — | Later | `SEC-authentication`, `SEC-student-isolation`, `SEC-passwords` | — | — | — | No student sign-in, verification, reset, or session tests; shared token checks do not count. |
| [`UC-BNCH-complete-baseline-assessment`](requirements/use-cases.md#uc-bnch-complete-baseline-assessment-complete-a-baseline-assessment) | 📐 Designed: original submission only | — | Later | `SEC-authentication`, `SEC-student-isolation`, `ROB-invalid-data` | [Merged baseline design](design/design-of-record.md); gate, draft, and defaults need revision | — | — | No implementation tests. Design's existing test list applies to original submission. |
| [`UC-CHAT-resume-conversation`](requirements/use-cases.md#uc-chat-resume-conversation-reopen-a-saved-conversation) | ❌ Not started | — | Later | `SEC-authentication`, `SEC-student-isolation`, `ROB-external-service` | — | — | — | No persisted transcript or reload/cross-user tests. Current follow-up tests cover an open view only. |
| [`UC-CHAT-work-through-problem`](requirements/use-cases.md#uc-chat-work-through-problem-get-guidance-from-coach) | ✅ Built: checkpoint prototype | 🟡 Partial | Checkpoint 2 prototype | `SAF-ai-guidance`, `SAF-ai-transparency`, `PER-ai-response`, `ROB-external-service`, `ROB-invalid-data` | [As built](design/architectural-design.md#checkpoint-2-prototype-as-built) | [Coach](../gen-chem-mc/src/pages/Coach.tsx), [reply renderer](../gen-chem-mc/src/components/CoachMessage.tsx) | [Worker](../gen-chem-mc/backend/worker.ts), [gateway](../gen-chem-mc/backend/model.ts), [policy](../gen-chem-mc/backend/policy.ts) | [Coach](../gen-chem-mc/src/pages/Coach.test.tsx): text, Thinking, follow-up, retry/edit, timeout, abort; [images](../gen-chem-mc/src/pages/Coach.images.test.tsx): attachments, preflight, image-only, retry/edit; [gateway](../gen-chem-mc/backend/model.test.ts): auth token, request/response bounds, image context, failures and usage metadata; [formatting](../gen-chem-mc/src/components/CoachMessage.test.tsx). No automated evidence for semantic answer-leak compliance, off-topic redirection, 3-second timing, or full-class capacity. |
| [`UC-SLOG-review-study-summary`](requirements/use-cases.md#uc-slog-review-study-summary-view-personal-study-progress) | ❌ Not started | — | Later | `SEC-authentication`, `SEC-student-isolation`, `ROB-external-service` | — | [Progress page shell only](../gen-chem-mc/src/pages/Progress.tsx) | — | No study-summary tests. |
| [`UC-TIMR-run-study-session`](requirements/use-cases.md#uc-timr-run-study-session-run-a-timed-study-session) | ❌ Not started | — | Later | `ROB-study-session`, `PER-study-log`, `ROB-invalid-data`, `SEC-student-isolation` | — | [Study page shell only](../gen-chem-mc/src/pages/Study.tsx) | — | No timer, restoration, save, or confidence-check tests. |

## Scope gaps for review

- **Course grounding:** No approved course corpus or retrieval pipeline is connected. A student-uploaded problem is input to Coach, not instructor-approved grounding. Decide whether to specify this feature next or revise the published scope.
- **Manual logging:** The future timer produces its own records. No separate flow is written for studying outside the app.
- **Structured reflection:** A conversational starter and before/after confidence prompts are not a saved reflection workflow. The published reflection feature remains untraced.
- **Consent and instructor reporting:** Account access is captured. Research consent and the instructor metrics view remain separate decisions, with no prototype implementation or added use-case rows.
- **Previously suggested extras:** Timed practice, expected/actual grades, worksheet, tutor handoff, coaching modes, and gamification are not commitments in this checkpoint draft.

See [OI-7](requirements/OPEN-ISSUES.md#open) for scope reconciliation. Keep gaps visible until the team adds use cases or changes the scope with the client.
