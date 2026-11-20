# Traceability Matrix

**Project:** Gen Chem Metacognition
**Team:** Team #4
**Version:** 0.2
**Last checked:** 2026-11-20, by Giang Tran

---

_**What this file is.** The map of the project, from the reason something exists to the thing that does it. Every other document owns its own contents; this one owns the **links between them**. Rules, objectives and use cases are cited by identifier, never restated._

_**How to check it.** Each table ends with its checks and their current result. A failing check is recorded, not hidden: a blank or flagged cell is information, and a confidently wrong link is worse than no link._

---

## 1. Feature to use case area

_Features (`FEAT-*`) and objectives (`BO-*`) are defined in [vision and scope](requirements/vision-and-scope.md); areas and use cases in [use cases](requirements/use-cases.md) §3. Scope status follows vision and scope §5._

| Feature | Scope | Business objectives | Use case areas |
|---|---|---|---|
| `FEAT-guided-chatbot` | MVP | `BO-problem-dissection` (measured by `SM-no-answer-given`) | `CHAT` |
| `FEAT-course-grounding` | MVP | `BO-problem-dissection` | `GRND` |
| `FEAT-benchmark-quiz` | MVP | `BO-study-awareness`, `BO-freshman-transition` | `BNCH` |
| `FEAT-pomodoro-timer` | MVP | `BO-study-awareness` | `TIME` |
| `FEAT-study-session-log` | MVP | `BO-study-awareness` (measured by `SM-session-logging`) | `LOG` |
| `FEAT-reflection` | MVP | `BO-self-reflection` (measured by `SM-reflection-completion`) | `REFL` |
| `FEAT-chat-modes` | Candidate (`OI-MODES`) | (enabling, serves no objective directly) | `MODE` |
| `FEAT-study-planning` | Candidate | `BO-freshman-transition` | `PLAN` |
| `FEAT-account-consent` | Candidate | `BO-outcome-evidence` (enabling) | `ACCT` |
| `FEAT-safety-escalation` | Candidate (`OI-SAFETY-ESCALATION`) | (enabling, serves no objective directly) | `SAFE` |
| `FEAT-d2l-grades-read` | Postponed | `BO-outcome-evidence` (measured by `SM-grade-association`) | `GRAD` |
| `FEAT-assignment-tracker` | Postponed | `BO-freshman-transition` | `TRAK` |
| `FEAT-notifications` | Postponed | `BO-freshman-transition` | `NOTF` |
| `FEAT-leaderboard`, `FEAT-streak` | Postponed (`OI-GAMIFICATION`) | (enabling, serves no objective directly) | `GAME` |
| `FEAT-multi-class` | Long-term | — | — (no area by design; MVP is one course) |
| `FEAT-school-wide` | Long-term | — | — (no area by design) |

**Checks (2026-11-20).**

1. **Every feature has at least one area.** Passes, except `FEAT-multi-class` and `FEAT-school-wide`, which have no area **on purpose**: they are long-term goals outside this project (vision and scope §5).
2. **Every area is reached by a feature.** Passes: all 14 areas in use cases §3 are reached.

_Only the `SM-*` links are stated in vision and scope; the other objective links were assigned by the team from each objective's description and should be confirmed in the next vision-and-scope revision._

---

## 2. Business rule to what enforces it

_Rule text and sources live in [business rules](requirements/business-rules.md). The Source column is the one duplication allowed here._

| Business rule | Source | Enforced by |
|---|---|---|
| `BR-no-direct-answers` | Heidi Conrad, client meeting, 2026-09-08 | `UC-CHAT-work-through-problem` extension 5a; `UC-CHAT-check-own-answer`; `UC-CHAT-share-problem-image`; coach policy in [`policy.ts`](../gen-chem-mc/backend/policy.ts) |
| `BR-answer-confirmation-only` | Heidi Conrad, client meeting notes | `UC-CHAT-check-own-answer` extensions 5a–5c; [`policy.ts`](../gen-chem-mc/backend/policy.ts). **Not yet cited** in that use case's Business Rules field |
| `BR-student-initiated-breakdown` | Heidi Conrad, client meeting notes | `UC-CHAT-work-through-problem` extension 7a; [`policy.ts`](../gen-chem-mc/backend/policy.ts). **Not yet cited** in that use case's Business Rules field |
| `BR-no-content-teaching` | Client project brief | [`policy.ts`](../gen-chem-mc/backend/policy.ts); constrains `FEAT-study-planning` (candidate). No specified use case cites it yet |
| `BR-leaderboard-professor-only` _(unconfirmed)_ | Team brainstorm, not client-confirmed | `UC-GAME-view-class-leaderboard` (postponed, not yet specified) |
| `BR-student-information-confidentiality` _(candidate)_ | Team decision 2026-11-06, client confirmation pending (`OI-PRIVACY`) | `UC-ACCT-*` (candidate, not yet specified) |

**Checks (2026-11-20).**

1. **Every rule is enforced by something.** Passes for the four confirmed rules. The two candidate rules point only at unspecified use cases, which is expected until the client confirms them.
2. **Every cited rule exists.** **Two findings:**
   - `BR-error-reflection` is named in use cases §1.3 but is not defined in business rules. Either define it from the interview notes or remove the mention.
   - `BR-no-direct-answers` is defined **twice** in business rules §2.1. Delete the second entry and keep the one with the dated source.

---

## 3. Functional traceability matrix

### How to use it

- **One row per use case**, in the order of use cases §3.
- **Build** is the state of the code only (legend below). It makes no claim about tests.
- **Verify** is independent of Build: a built use case with no test reads `🔎 None`. `—` means nothing is built yet.
- **Release** is the tag the row's code ships in (legend below). It tracks Build only; missing tests on a shipped row are test debt, visible in Verify.
- **Quality reqs** lists the SRS quality requirements the use case depends on beyond its own steps. `—` means none beyond its own steps.
- **Design** is the area's design-of-record once its pull request has merged; `—` until then.
- **Tests** names which extensions are exercised and which are not. A row is `✅ Verified` only if a passing test covers the main flow **and every extension**; otherwise it is `🟡 Partial` and the gap is named.
- When a use case is added to use cases §3, add its row here with Build `❌ Not started`, Verify `—`, and a Release value.

### Build legend

| Symbol | Meaning |
|--------|---------|
| ❌ Not started | No design, no code. |
| 🔬 Problem-validated | The use case has been challenged and its spec fixed; no solution design yet. |
| 📐 Designed | The area's design-of-record is written and merged; not yet coded. |
| 🟡 In progress | Partially built. |
| ✅ Built | Code complete for the use case's flow. Makes no claim about tests. |

### Verify legend

| Symbol | Meaning |
|--------|---------|
| ✅ Verified | Passing automated tests cover the main flow and every extension. |
| 🟡 Partial | Some flows or extensions are tested; the Tests cell names the gap. |
| 🔎 None | Built, but no automated test exists. |
| — | Nothing built to verify yet. |

### Release legend

| Value | Meaning |
|-------|---------|
| v1.0.0 | Shipped 2026-11-20 ([release](https://github.com/Boommage/Gen-Chem-MC/releases/tag/v1.0.0), commit `910a8f3`): the guided chat coach. |
| v1.1.0 | Planned: the MVP demo release (December 2026), the remaining MVP use cases. Rows move out of it with the client if the calibration forecast says they do not fit. |
| Later | In scope, not yet scheduled (candidate features awaiting client decisions). |
| (empty) | Postponed in vision and scope §5; out of the MVP. |

### Matrix

**Code paths** are relative to this file. **Untested model behavior:** extensions that depend on what the AI coach says (refusing a full answer, judging an answer) have no automated test yet; only the policy being sent is tested. This is the gap measured by `SM-no-answer-given`.

| UC | Use case | Build | Verify | Release | Quality reqs | Design | Frontend | Backend | Tests |
|----|----------|-------|--------|---------|--------------|--------|----------|---------|-------|
| `UC-BNCH-complete-baseline-assessment` | Complete a baseline assessment | 📐 Designed | — | v1.1.0 | — | [design-of-record](design/design-of-record.md) | — | — | — |
| `UC-BNCH-view-baseline-results` | View baseline study-habit profile | ❌ Not started | — | v1.1.0 | — | — | — | — | — |
| `UC-BNCH-retake-baseline-assessment` | Retake the baseline assessment | ❌ Not started | — | v1.1.0 | — | — | — | — | — |
| `UC-CHAT-work-through-problem` | Work through a problem with the coach | ✅ Built | 🟡 Partial | v1.0.0 | `PER-ai-response`, `ROB-external-service` | — | [`Coach.tsx`](../gen-chem-mc/src/pages/Coach.tsx), [`CoachMessage.tsx`](../gen-chem-mc/src/components/CoachMessage.tsx) | [`model.ts`](../gen-chem-mc/backend/model.ts), [`policy.ts`](../gen-chem-mc/backend/policy.ts), [`coach.ts`](../gen-chem-mc/shared/coach.ts) | [`Coach.test.tsx`](../gen-chem-mc/src/pages/Coach.test.tsx), [`model.test.ts`](../gen-chem-mc/backend/model.test.ts), [`coach.test.ts`](../gen-chem-mc/shared/coach.test.ts): main flow + 3a, 4a, 7b. **Untested: 5a, 7a** (model behavior) |
| `UC-CHAT-check-own-answer` | Have the coach check own answer | ✅ Built | 🟡 Partial | v1.0.0 | `PER-ai-response`, `ROB-external-service` | — | same as above | same as above | Same tests: main flow + 3b, 4a. **Untested: 3a, 5a, 5b, 5c, 7a** (model behavior) |
| `UC-CHAT-share-problem-image` | Share a problem via photo or screenshot | ✅ Built | 🟡 Partial | v1.0.0 | `PER-ai-response`, `ROB-external-service` | — | [`Coach.tsx`](../gen-chem-mc/src/pages/Coach.tsx), [`imageAttachment.ts`](../gen-chem-mc/src/lib/imageAttachment.ts) | [`model.ts`](../gen-chem-mc/backend/model.ts), [`images.ts`](../gen-chem-mc/shared/images.ts) | [`Coach.images.test.tsx`](../gen-chem-mc/src/pages/Coach.images.test.tsx), [`imageAttachment.test.ts`](../gen-chem-mc/src/lib/imageAttachment.test.ts), [`images.test.ts`](../gen-chem-mc/shared/images.test.ts), [`model.test.ts`](../gen-chem-mc/backend/model.test.ts): main flow + 6a, 6b, 7a, 9a. **Untested: 5a** (cancel file picker), **10a, 10b** (model behavior) |
| `UC-CHAT-start-new-conversation` | Start a fresh conversation | ❌ Not started | — | v1.1.0 | — | — | — | — | — |
| `UC-CHAT-resume-conversation` | Resume an existing conversation | ❌ Not started | — | v1.1.0 | — | — | — | — | — (needs chat-history storage) |
| `UC-GRND-add-course-material` | Add course material for grounding | ❌ Not started | — | v1.1.0 | — | — | — | — | — |
| `UC-GRND-remove-course-material` | Remove or replace course material | ❌ Not started | — | v1.1.0 | — | — | — | — | — |
| `UC-TIME-run-study-session` | Run a timed study session | ❌ Not started | — | v1.1.0 | `ROB-study-session` | — | — | — | — |
| `UC-TIME-set-timer-lengths` | Set focus and break durations | ❌ Not started | — | v1.1.0 | — | — | — | — | — |
| `UC-TIME-abandon-study-session` | End a study session early | ❌ Not started | — | v1.1.0 | — | — | — | — | — |
| `UC-LOG-log-study-session` | Log a session done outside the app | ❌ Not started | — | v1.1.0 | `ROB-invalid-data` | — | — | — | — |
| `UC-LOG-delete-study-session` | Delete a logged session | ❌ Not started | — | v1.1.0 | — | — | — | — | — |
| `UC-LOG-view-study-history` | View historical study sessions | ❌ Not started | — | v1.1.0 | `PER-study-log` | — | — | — | — |
| `UC-LOG-view-study-summary` | View study patterns and metrics | ❌ Not started | — | v1.1.0 | `PER-page-load` | — | — | — | — |
| `UC-REFL-reflect-after-session` | Reflect after a study session | ❌ Not started | — | v1.1.0 | — | — | — | — | — |
| `UC-REFL-reflect-after-assessment` | Reflect after a quiz or exam | ❌ Not started | — | v1.1.0 | — | — | — | — | — |
| `UC-REFL-view-past-reflections` | Review past reflections | ❌ Not started | — | v1.1.0 | — | — | — | — | — |
| `UC-MODE-choose-coaching-style` | Choose coaching style | ❌ Not started | — | Later | — | — | — | — | — |
| `UC-PLAN-create-study-plan` | Plan study timing and duration | ❌ Not started | — | Later | — | — | — | — | — |
| `UC-PLAN-adjust-study-plan` | Modify a study plan | ❌ Not started | — | Later | — | — | — | — | — |
| `UC-ACCT-sign-in` | Sign in | ❌ Not started | — | Later | — | — | — | — | — |
| `UC-ACCT-sign-out` | Sign out | ❌ Not started | — | Later | — | — | — | — | — |
| `UC-ACCT-use-anonymously` | Use without identification | ❌ Not started | — | Later | — | — | — | — | — |
| `UC-ACCT-give-research-consent` | Consent to research data linking | ❌ Not started | — | Later | — | — | — | — | — |
| `UC-ACCT-withdraw-research-consent` | Withdraw research consent | ❌ Not started | — | Later | — | — | — | — | — |
| `UC-ACCT-delete-my-data` | Delete my account data | ❌ Not started | — | Later | — | — | — | — | — |
| `UC-SAFE-respond-to-distress` | Get support resources when distressed | ❌ Not started | — | Later | — | — | — | — | — |
| `UC-GRAD-import-grades` | Import grades from D2L | ❌ Not started | — | | — | — | — | — | — |
| `UC-TRAK-sync-assignment-deadlines` | Sync assignment deadlines | ❌ Not started | — | | — | — | — | — | — |
| `UC-NOTF-receive-study-reminder` | Receive a study reminder | ❌ Not started | — | | — | — | — | — | — |
| `UC-NOTF-set-reminder-preferences` | Set reminder preferences | ❌ Not started | — | | — | — | — | — | — |
| `UC-GAME-view-study-streak` | View a study streak | ❌ Not started | — | | — | — | — | — | — |
| `UC-GAME-view-class-leaderboard` | View the class leaderboard | ❌ Not started | — | | — | — | — | — | — |

**Known gaps (2026-11-20).**

- No `CHAT` design-of-record exists; the built chat rows cite none. The chat design currently lives in [architectural design](design/architectural-design.md) §5–§6.
- Every built row is `🟡 Partial` because extensions that depend on the AI coach's judgment have no automated test. Closing that gap means an adversarial prompt test set (`SM-no-answer-given`).
- Extension 3a of `UC-CHAT-work-through-problem` says the system *prompts* the student on an empty message; the test only checks that whitespace is not sent. Confirm the UI matches the spec, and fix whichever is wrong.

---

## Working this document with your agent

_Delegate: running the checks above and reporting what fails; finding every `BR-`, `FEAT-` and `UC-` identifier cited in `docs/` that has no definition; checking that every link in this file resolves._

_Keep human: whether an area with no feature is a missing feature or a use case that should not exist; whether an unenforced rule is an oversight or a decision; and whether a row is really `✅ Verified`. Verify every row you did not write yourself by opening the file at the other end._
