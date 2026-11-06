# Master Use Case Inventory & Area Index

**Status:** Draft for Team Review  
**Governance Note:** Use Case IDs locked upon team sign-off. IDs cannot be renamed or moved across system areas once published to GitHub.  
**Related documents:** Features and open issues come from [vision and scope](requirements/vision-and-scope.md) (§4.2, §5). Full specifications live in [use cases](requirements/use-cases.md), rules in [business rules](requirements/business-rules.md), quality requirements in the [SRS](requirements/software-requirements-specification.md) (§9), and build and test status in the [traceability matrix](traceability.md).

---

## 1. Area Codes & Feature Mapping

| Area Code | Feature | Scope Status | Notes |
| :--- | :--- | :--- | :--- |
| **BNCH** | `FEAT-benchmark-quiz`: Benchmark Quiz | MVP | Baseline study-habits assessment and the student's habit profile |
| **CHAT** | `FEAT-guided-chatbot`: Guided Chatbot | MVP | Coaching that guides and never gives the answer |
| **GRND** | `FEAT-course-grounding`: Course Grounding | MVP | Instructor course materials the coach is grounded in |
| **TIME** | `FEAT-pomodoro-timer`: Pomodoro Timer | MVP | Timed study sessions, restored after a refresh (`ROB-study-session`) |
| **LOG** | `FEAT-study-session-log`: Study Session Log | MVP | Session records and the personal study summary |
| **REFL** | `FEAT-reflection`: Reflection | MVP | Nonjudgmental metacognitive reflection prompts |
| **MODE** | `FEAT-chat-modes`: Chat Modes | Candidate | Supportive or concise coaching style |
| **PLAN** | `FEAT-study-planning`: Study Planning | Candidate | Scheduling within `BR-no-content-teaching` |
| **ACCT** | `FEAT-account-consent`: Account & Consent | Candidate | Sign-in, anonymity, consent, and data management |
| **SAFE** | `FEAT-safety-escalation`: Safety Escalation | Candidate | Explicit decision required for distress flows |
| **GRAD** | `FEAT-d2l-grades-read`: D2L Grades | Postponed | Deferred to post-MVP |
| **TRAK** | `FEAT-assignment-tracker`: Assignment Tracker | Postponed | Deferred to post-MVP |
| **NOTF** | `FEAT-notifications`: Notifications | Postponed | Deferred to post-MVP |
| **GAME** | `FEAT-leaderboard`, `FEAT-streak`: Leaderboard / Streak | Postponed | Deferred to post-MVP |

---

## 2. MVP Use Cases (20 Requirements)

### Area: Benchmark Quiz (BNCH)
| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-BNCH-complete-baseline-assessment` | Complete a baseline assessment | Student | Specification written in [use cases](requirements/use-cases.md); design in [design-of-record](design/design-of-record.md) |
| `UC-BNCH-view-baseline-results` | View baseline study-habit profile | Student | Displays the student's recorded baseline responses |
| `UC-BNCH-retake-baseline-assessment` | Retake the baseline assessment | Student | Pending decision on whether retakes are allowed (open issue in `UC-BNCH-complete-baseline-assessment`) |

### Area: Guided Chatbot (CHAT)
*Governed by `BR-no-direct-answers`, `BR-answer-confirmation-only`, `BR-student-initiated-breakdown`, and `BR-no-content-teaching`.*

| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-CHAT-work-through-problem` | Work through a chemistry problem with the coach | Student | Built on `codex/gemma-unified-integration`. Handles retry and edit after a failure, provider timeout, and answer requests as extensions |
| `UC-CHAT-check-own-answer` | Have coach check a student-derived answer | Student | The only path that may confirm an answer (`BR-answer-confirmation-only`) |
| `UC-CHAT-share-problem-image` | Share a problem via photo or screenshot | Student | Built on `codex/gemma-unified-integration`. JPEG or PNG only, at most 2 MB, 4096 px per side and 12 MP; at most 2 images in recent context |
| `UC-CHAT-start-new-conversation` | Start a fresh conversation | Student | Explicit conversation reset; today history clears only on leaving or refreshing Coach |
| `UC-CHAT-resume-conversation` | Resume an existing conversation | Student | Retrieves a saved conversation; needs chat-history storage, which does not exist yet |

### Area: Course Grounding (GRND)
| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-GRND-add-course-material` | Add course material for coach grounding | Instructor / Team | Admin interface dependent on `AS-training-data` |
| `UC-GRND-remove-course-material` | Remove or replace outdated course material | Instructor / Team | Handles curriculum updates and versioning |

### Area: Pomodoro Timer (TIME)
| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-TIME-run-study-session` | Run a timed study session | Student | Start, pause, resume, finish. Restores state after a refresh (`ROB-study-session`) |
| `UC-TIME-set-timer-lengths` | Set focus and break durations | Student | Custom values overriding the default 25/5 setup |
| `UC-TIME-abandon-study-session` | End a study session early | Student | Decides whether a partial session is kept or discarded |

### Area: Study Session Log (LOG)
| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-LOG-log-study-session` | Log a study session done outside the app | Student | Method, duration, and time of day (`OI-STUDY-METHODS` pending) |
| `UC-LOG-delete-study-session` | Delete a logged study session | Student | Removes the entry from the student's history |
| `UC-LOG-view-study-history` | View historical study sessions | Student | A saved session appears in history within 2 seconds (`PER-study-log`) |
| `UC-LOG-view-study-summary` | View study patterns and metrics | Student | Nonjudgmental summary on the Progress page |

### Area: Reflection (REFL)
| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-REFL-reflect-after-session` | Reflect after completing a study session | Student | Post-session metacognitive prompt flow |
| `UC-REFL-reflect-after-assessment` | Reflect after a quiz or exam | Student | Compares how the student studied and the grade they expected with their result, which is self-reported because D2L grades are postponed |
| `UC-REFL-view-past-reflections` | Review past reflection entries | Student | Lets the student recognize patterns over time |

---

## 3. Candidate Use Cases (10 Pending Decisions)

| ID | Goal | Actor | Blocking Issue / Dependency |
| :--- | :--- | :--- | :--- |
| `UC-MODE-choose-coaching-style` | Choose supportive or concise coaching style | Student | `OI-MODES` |
| `UC-PLAN-create-study-plan` | Plan study session timing and duration | Student | Client confirmation that planning stays within `BR-no-content-teaching` |
| `UC-PLAN-adjust-study-plan` | Modify existing study plan | Student | Client confirmation that planning stays within `BR-no-content-teaching` |
| `UC-ACCT-sign-in` | Sign in to the system | Student | `OI-ANONYMITY`, `SEC-authentication` |
| `UC-ACCT-sign-out` | Sign out of the system | Student | `OI-ANONYMITY`, `SEC-authentication` |
| `UC-ACCT-use-anonymously` | Use the system without identification | Student | `OI-ANONYMITY`, `BR-student-information-confidentiality` |
| `UC-ACCT-give-research-consent` | Consent to data linking for research | Student | `OI-IRB`, `SEC-grade-consent` |
| `UC-ACCT-withdraw-research-consent` | Withdraw prior research consent | Student | `OI-IRB`; any consent flow needs a withdrawal path |
| `UC-ACCT-delete-my-data` | Delete my account data | Student | `OI-PRIVACY` (retention policy) |
| `UC-SAFE-respond-to-distress` | Get support resources when expressing distress | Student (secondary: the person alerted) | `OI-SAFETY-ESCALATION` |

---

## 4. Postponed Use Cases (6 Reserved IDs)

- `UC-GRAD-import-grades` — Read-only D2L grade import for consenting students
- `UC-TRAK-sync-assignment-deadlines` — Assignment deadlines synced from D2L
- `UC-NOTF-receive-study-reminder` — Targeted study reminders
- `UC-NOTF-set-reminder-preferences` — Reminder frequency and timing preferences
- `UC-GAME-view-study-streak` — Consecutive days studied
- `UC-GAME-view-class-leaderboard` — Class leaderboard; instructor-only visibility unconfirmed (`BR-leaderboard-professor-only`)

---

## 5. Architectural & Requirements Decisions

### Item 1: Instructor View & Traceability
The vision document mentions a potential instructor view (§3.1), but no feature currently maps to it. Adding an `INST` area now would fail the second check in [traceability](traceability.md) §1: *"An area no feature points at means you have use cases no stakeholder asked for."*
- **Action:** Either formally draft an instructor-view feature with the client, or explicitly exclude instructor interfaces from this release phase.

### Item 2: Dashboard Classification
The main dashboard ("Here's what matters most today") currently lacks an owning feature.
- **Action:** Classify as structural navigation (`USE-core-navigation`) rather than an explicit functional use case, provided it only aggregates existing widget state without introducing novel business logic.

### Item 3: Exception & Extension Scope Boundaries
Interaction variants—such as requesting direct answers, editing a failed message, or retrying after a model timeout—are defined as extensions of `UC-CHAT-work-through-problem`.
- **Action:** Keep these behaviors inside the parent use case's extension steps, so the adversarial prompt set for `SM-no-answer-leak` stays mapped to one specification.

### Item 4: Business Rules Audit & Corrections
Review of [business rules](requirements/business-rules.md) identified two inconsistencies requiring cleanup:
- **Duplicate Identifier:** `BR-no-direct-answers` is defined twice in §2.1 of `business-rules.md`.
- **Missing Rule Definition:** The [client interview notes](meetings/client-interview-2026-09-08.md) record a rule that incorrect reasoning should trigger prompts to reconsider (written there as `BR-ERROR-REFLECTION`). It was not carried into `business-rules.md`; add it as `BR-error-reflection`.
