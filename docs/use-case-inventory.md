# Master Use Case Inventory & Area Index

**Status:** Draft for Team Review  
**Governance Note:** Use Case IDs locked upon team sign-off. IDs cannot be renamed or moved across system areas once published to GitHub.

---

## 1. Area Codes & Feature Mapping

| Area Code | Feature Name | Scope Status | Notes |
| :--- | :--- | :--- | :--- |
| **BNCH** | Benchmark Quiz | MVP | Baseline assessment and profile generation |
| **CHAT** | Guided Chatbot | MVP | Pedagogy-constrained AI coaching flow |
| **GRND** | Course Grounding | MVP | Material ingestion and contextual bounds |
| **TIME** | Pomodoro Timer | MVP | Focus session execution and state sync |
| **LOG** | Study Session Log | MVP | Session recording and analytics tracking |
| **REFL** | Reflection | MVP | Meta-cognitive prompts and evaluation |
| **MODE** | Chat Modes | Candidate | Coaching style adjustments |
| **PLAN** | Study Planning | Candidate | Scheduling within pedagogical rules |
| **ACCT** | Account & Consent | Candidate | Auth, anonymity, and data management |
| **SAFE** | Safety Escalation | Candidate | Explicit decision required for distress flows |
| **GRAD** | D2L Grades | Postponed | Deferred to post-MVP |
| **TRAK** | Assignment Tracker | Postponed | Deferred to post-MVP |
| **NOTF** | Notifications | Postponed | Deferred to post-MVP |
| **GAME** | Leaderboard / Streak | Postponed | Deferred to post-MVP |

---

## 2. MVP Use Cases (21 Requirements)

### Area: Benchmark Quiz (BNCH)
| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-BNCH-complete-baseline-assessment` | Complete a baseline assessment | Student | Baseline questionnaire flow (Specification written) |
| `UC-BNCH-view-baseline-results` | View baseline study-habit profile | Student | Displays recorded quiz results and initial archetype |
| `UC-BNCH-retake-baseline-assessment` | Retake the baseline assessment | Student | Pending decision on retake allowance rules |

### Area: Guided Chatbot (CHAT)
*Governed by BR-no-direct-answers, BR-answer-confirmation-only, BR-student-initiated-breakdown, and BR-no-content-teaching.*

| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-CHAT-work-through-problem` | Work through a chemistry problem with the coach | Student | Branch built. Handles failure retries, timeout, and prompt extensions |
| `UC-CHAT-check-own-answer` | Have coach check a student-derived answer | Student | Single path allowing answer confirmation (BR-answer-confirmation-only) |
| `UC-CHAT-share-problem-image` | Share a problem via photo or screenshot | Student | Branch built. Validates image size (<=2MB), dimensions, and limits |
| `UC-CHAT-start-new-conversation` | Start a fresh conversation | Student | Explicit session reset mechanism |
| `UC-CHAT-resume-conversation` | Resume an existing conversation | Student | Session retrieval mechanism from db |

### Area: Course Grounding (GRND)
| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-GRND-add-course-material` | Add course material for coach grounding | Instructor / Team | Admin interface dependent on AS-training-data |
| `UC-GRND-remove-course-material` | Remove or replace outdated course material | Instructor / Team | Handles curriculum updates and versioning |

### Area: Pomodoro Timer (TIME)
| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-TIME-run-study-session` | Run a timed study session | Student | Start, pause, resume, finish. Requires state restoration on refresh |
| `UC-TIME-set-timer-lengths` | Set focus and break durations | Student | Custom values overriding default 25/5 setup |
| `UC-TIME-pause-timer` | Pause the timer, pausing the study session manually | Student | Happens during the session run |
| `UC-TIME-abandon-study-session` | End a study session early | Student | Evaluates partial session retention or discard logic |

### Area: Study Session Log (LOG)
| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-LOG-log-study-session` | Log external study session | Student | Duration and method selection (OI-STUDY-METHODS pending) |
| `UC-LOG-delete-study-session` | Delete a logged study session | Student | Removes entry from student history |
| `UC-LOG-view-study-history` | View historical study sessions | Student | Requires UI update within 2 seconds (PER-study-log) |
| `UC-LOG-view-study-summary` | View study patterns and metrics | Student | Non-judgmental analytics view on Progress page |

### Area: Reflection (REFL)
| ID | Goal | Primary Actor | Implementation Notes |
| :--- | :--- | :--- | :--- |
| `UC-REFL-reflect-after-session` | Reflect after completing a study session | Student | Post-session meta-cognitive prompt flow |
| `UC-REFL-reflect-after-assessment` | Reflect after a quiz or exam | Student | Compares study effort/expected score against actual grade |
| `UC-REFL-view-past-reflections` | Review past reflection entries | Student | Enables longitudinal pattern identification |

---

## 3. Candidate Use Cases (10 Pending Decisions)

| ID | Goal | Actor | Blocking Issue / Dependency |
| :--- | :--- | :--- | :--- |
| `UC-MODE-choose-coaching-style` | Choose supportive or concise coaching style | Student | OI-MODES |
| `UC-PLAN-create-study-plan` | Plan study session timing and duration | Student | BR-no-content-teaching |
| `UC-PLAN-adjust-study-plan` | Modify existing study plan | Student | BR-no-content-teaching |
| `UC-ACCT-sign-in` | Authenticate into system | Student | OI-ANONYMITY, SEC-authentication |
| `UC-ACCT-sign-out` | Terminate active session | Student | OI-ANONYMITY, SEC-authentication |
| `UC-ACCT-use-anonymously` | Access system features without identification | Student | OI-ANONYMITY, BR-student-information-confidentiality |
| `UC-ACCT-give-research-consent` | Consent to data linking for research | Student | OI-IRB, SEC-grade-consent |
| `UC-ACCT-withdraw-research-consent` | Revoke prior research consent | Student | Requirement for compliance flow |
| `UC-ACCT-delete-my-data` | Purge student account data | Student | OI-PRIVACY (Retention policy) |
| `UC-SAFE-respond-to-distress` | Trigger support resources on distress signals | Student / System | OI-SAFETY-ESCALATION |

---

## 4. Postponed Use Cases (6 Reserved IDs)

- `UC-GRAD-import-grades` — D2L grade synchronization
- `UC-TRAK-sync-assignment-deadlines` — Assignment date integration
- `UC-NOTF-receive-study-reminder` — Push/email notifications
- `UC-NOTF-set-reminder-preferences` — Notification threshold rules
- `UC-GAME-view-study-streak` — Gamification engagement streaks
- `UC-GAME-view-class-leaderboard` — Aggregate peer view (Instructor permission unconfirmed)

---

## 5. Architectural & Requirements Decisions

### Item 1: Instructor View & Traceability
The vision document mentions a potential instructor interface, but no feature currently maps to it. Adding an `INST` area tag now will trigger a traceability validation failure (*"Area code without target feature"*).
- **Action:** Either formally draft an Instructor Scope Feature with the client, or explicitly exclude instructor interfaces from this release phase.

### Item 2: Dashboard Classification
The main dashboard ("Here's what matters most today") currently lacks an owning feature.
- **Action:** Classify as structural navigation (`USE-core-navigation`) rather than an explicit functional use case, provided it only aggregates existing widget state without introducing novel business logic.

### Item 3: Exception & Extension Scope Boundaries
Interaction variants—such as requesting direct answers, editing prompts mid-flow, or model timeout retries—are defined as extensions of `UC-CHAT-work-through-problem`.
- **Action:** Keep these behaviors inside parent Use Case extension steps to ensure test suites (`SM-no-answer-leak`) remain tightly mapped to single specification bounds.

### Item 4: Business Rules Audit & Corrections
Review of `business-rules.md` identified two inconsistencies requiring cleanup:
- **Duplicate Identifier:** `BR-no-direct-answers` is defined twice across the spec files.
- **Missing Rule Definition:** Interview transcript references `BR-ERROR-REFLECTION` (*incorrect reasoning must trigger reflective prompts*), which was omitted from the specification document.
