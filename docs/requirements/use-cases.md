# Use Cases

**Project:** Gen Chem Metacognition
**Team:** Team #4
**Client:** Heidi Conrad - TCU Chemistry
**Version:** 0.3

---

_**How to use this template.** Instructions appear in italic square brackets. Fill in underneath them and leave them in place until the document is stable._

_**What a use case is.** One goal a user can accomplish with your system, written as the dialogue between the actor and the system, including what happens when it goes wrong. It is the unit of work in this course: one use case becomes one issue, one branch, one pull request, and one set of tests._

_**Why the use case and not the user story.** You will meet user stories in industry, and they are a good planning tool: "As a student, I want to submit my report so that I get credit." A story is deliberately under-specified, because it is a **placeholder for a conversation** that happens later, between people. That is exactly the wrong property when the thing building your code is an agent that will implement precisely what the specification says and never ask what you meant. Use stories to plan and prioritize. Build against use cases._

_The difference that matters is the parts a story does not have: preconditions, the step-by-step flow, and above all the **extensions**, which is where the failure paths live. Most defects your team ships this semester will be in a path nobody wrote down._

## Identifiers

_Use cases are identified as `UC-<AREA>-<slug>`, where the area code groups related functionality and the slug is coined from the goal: `UC-RUB-create-rubric`, `UC-WAR-manage-activities`, `UC-STU-invite-students`._

_Pick your own area codes from your project's feature areas, three or four letters each, and list them at the top of the Use Case List. Areas correspond to the `FEAT-*` entries in your [vision and scope](vision-and-scope.md), which is where use cases come from._

_**Never renumber, rename, or repoint an identifier.** Moving a use case between areas would change its identifier, so put it in the right area the first time, and if you get it wrong, leave it. An identifier is an address, not a description._

_Within one use case, `PRE-1`, `POST-1`, and the step numbers are local and may be renumbered freely, because nothing outside the use case cites them._

## Revision History

| Date | Version | Description | Author |
|---|---|---|---|
| 2026-09-11 | 0.1 | Initial use cases derived from the vision and scope feature list | Victor Perez |
| 2026-11-16 | 0.2 | Merged the master use-case inventory into the use-case list and recorded its scope, dependencies, and open items in this document. | Team 4 |
| 2026-11-19 | 0.3 | Add use cases for `CHAT` area code | Giang Tran |

---

## 1. Introduction

### 1.1 Purpose

_[One paragraph: this document specifies the goals users can accomplish with the system, in enough detail that a developer knows what to build and a tester knows what to check.]_

This document identifies the user goals supported by the Gen Chem Metacognition Study Assistant. The use-case list is the authoritative inventory of stable use-case identifiers; each detailed specification defines the normal flow, failure paths, data, and rules needed to implement and test that goal. Items awaiting a client or architecture decision remain in the list with their dependency stated rather than being treated as approved requirements.

### 1.2 Scope

_[Which feature areas from the vision and scope are covered here. Name the `FEAT-*` entries. If a feature has no use cases yet, say so rather than leaving the reader to notice.]_

This document covers the MVP feature areas `FEAT-benchmark-quiz`, `FEAT-guided-chatbot`, `FEAT-course-grounding`, `FEAT-pomodoro-timer`, `FEAT-study-session-log`, and `FEAT-reflection`; the candidate areas `FEAT-chat-modes`, `FEAT-study-planning`, `FEAT-account-consent`, and `FEAT-safety-escalation`; and the postponed areas `FEAT-d2l-grades-read`, `FEAT-assignment-tracker`, `FEAT-notifications`, `FEAT-leaderboard`, and `FEAT-streak`. Candidate and postponed entries reserve identifiers but are not committed MVP work.

### 1.3 Inventory Decisions and Open Items

- The possible instructor view does not yet map to a feature area. It is excluded from this release unless the client approves an instructor-view feature; an `INST` area must not be added without that feature.
- The dashboard is structural navigation (`USE-core-navigation`), not a separate functional use case, while it only aggregates existing widget state.
- Direct-answer requests, message edits after failure, and model-provider timeouts are extensions of `UC-CHAT-work-through-problem`, not independent use cases.
- The business-rules audit found a duplicate `BR-no-direct-answers` entry and a missing `BR-error-reflection` candidate from the client interview notes. Resolve those in [business-rules.md](business-rules.md) before treating the latter as a governing rule.

---

## 2. Use Case Template

_[The field definitions. Every use case below uses exactly these fields, in this order.]_

**UC ID and Name.** _The identifier plus a concise name stating the value this use case provides to a user. Begin with an action verb, followed by an object: "Create a rubric", not "Rubric creation" and not "Rubric management", which is a feature, not a goal._

**Created By** and **Date Created.** _Who wrote it, and when._

**Primary and Secondary Actors.** _An actor is a person or other entity outside the system that interacts with it. The primary actor initiates this use case; secondary actors participate in completing it. Actors usually correspond to the user classes you identified in the vision and scope._

**Trigger.** _The business event, system event, or user action that starts the use case. The trigger tells the system to begin testing the preconditions._

**Description.** _A brief statement of the reason for and the outcome of this use case._

**Preconditions.** _What must already be true before this use case can start. **The system must be able to test each precondition**, which is what separates a precondition from a hope. Label them `PRE-1`, `PRE-2`. Example: PRE-1. The user's identity has been authenticated._

**Postconditions.** _The state of the system at successful conclusion. Label them `POST-1`, `POST-2`. Example: POST-1. The price of the item in the database has been updated with the new value._

**Main Success Scenario.** _The actor's actions and the system's responses under normal, expected conditions, as a numbered list that alternates between the two and ends by accomplishing the goal in the name. Write "The system validates..." not "The system will validate..."; use cases are written in the present tense._

**Extensions.** _Where the real work is. Two kinds, both numbered relative to the step they branch from:_

- _**Alternative flows**, other ways the use case can still succeed. Number them `4a`, `4b` for branches from step 4, with their own sub-steps `4a1`, `4a2`. Say where the flow branches off and, if it does, where it rejoins._
- _**Exceptions**, anticipated error conditions and how the system responds. Numbered the same way._

_**A use case with no extensions is not finished.** For every step, ask: what if the input is invalid, the thing is not found, the user cancels, the user is not allowed, or the external system is down? An agent building from a flow with no failure paths will invent the error handling, and you will not find out until a demo._

**Priority.** _Relative priority of implementing this. Use the same scheme across all your use cases._

**Frequency of Use.** _Roughly how often this is performed, per an appropriate unit of time. An early indicator of load, concurrency, and transaction volume, and it is the field that tells your architecture which use cases matter._

**Business Rules.** _The `BR-*` identifiers that govern this use case. **Identifiers only, never the rule's text**, so the rule has one home in [business-rules.md](business-rules.md) and cannot go stale here._

**Associated Information.** _Everything a developer needs that is not a step: the data fields and their validation rules, quality attributes that apply, display and sort strategies, and what happens if execution fails for a systemic reason such as a network timeout. If the use case makes a durable change, say whether a failure rolls it back, completes it, or leaves it partially done._

_Data fields are specified as a table:_

| Property name | Data type | Validation rule | Security or access concerns | Glossary reference |
|---|---|---|---|---|
| _[field]_ | _[type]_ | _[required, format, range]_ | _[who may see or set it]_ | _[term]_ |

**Related Use Cases.** _Other use cases this one invokes or is invoked by, by identifier and name._

**Assumptions.** _Anything assumed about this use case or how it executes._

**Open Issues.** _What you do not know yet. Mirror it into [OPEN-ISSUES.md](OPEN-ISSUES.md) so it is visible in one place._

---

## 3. Use Case List

_[Your area codes, then a table of every use case by area. Write this list first, before specifying any single use case in detail. It is the cheapest thing to review with your client, and finding out you missed a whole area costs minutes here rather than a week later.]_

| Area code | Feature area | Use cases |
|---|---|---|
| `BNCH` | `FEAT-benchmark-quiz`: Benchmark Quiz (MVP) | `UC-BNCH-complete-baseline-assessment`: Complete a baseline assessment; `UC-BNCH-view-baseline-results`: View baseline study-habit profile; `UC-BNCH-retake-baseline-assessment`: Retake the baseline assessment |
| `CHAT` | `FEAT-guided-chatbot`: Guided Chatbot (MVP) | `UC-CHAT-work-through-problem`: Work through a chemistry problem with the coach; `UC-CHAT-check-own-answer`: Have the coach check a student-derived answer; `UC-CHAT-share-problem-image`: Share a problem via photo or screenshot; `UC-CHAT-start-new-conversation`: Start a fresh conversation; `UC-CHAT-resume-conversation`: Resume an existing conversation |
| `GRND` | `FEAT-course-grounding`: Course Grounding (MVP) | `UC-GRND-add-course-material`: Add course material for coach grounding; `UC-GRND-remove-course-material`: Remove or replace outdated course material |
| `TIME` | `FEAT-pomodoro-timer`: Pomodoro Timer (MVP) | `UC-TIME-run-study-session`: Run a timed study session; `UC-TIME-set-timer-lengths`: Set focus and break durations; `UC-TIME-abandon-study-session`: End a study session early |
| `LOG` | `FEAT-study-session-log`: Study Session Log (MVP) | `UC-LOG-log-study-session`: Log a study session done outside the app; `UC-LOG-delete-study-session`: Delete a logged study session; `UC-LOG-view-study-history`: View historical study sessions; `UC-LOG-view-study-summary`: View study patterns and metrics |
| `REFL` | `FEAT-reflection`: Reflection (MVP) | `UC-REFL-reflect-after-session`: Reflect after completing a study session; `UC-REFL-reflect-after-assessment`: Reflect after a quiz or exam; `UC-REFL-view-past-reflections`: Review past reflection entries |
| `MODE` | `FEAT-chat-modes`: Chat Modes (Candidate; `OI-MODES`) | `UC-MODE-choose-coaching-style`: Choose supportive or concise coaching style |
| `PLAN` | `FEAT-study-planning`: Study Planning (Candidate; confirm compliance with `BR-no-content-teaching`) | `UC-PLAN-create-study-plan`: Plan study-session timing and duration; `UC-PLAN-adjust-study-plan`: Modify an existing study plan |
| `ACCT` | `FEAT-account-consent`: Account & Consent (Candidate; `OI-ANONYMITY`, `OI-IRB`, `OI-PRIVACY`) | `UC-ACCT-sign-in`: Sign in to the system; `UC-ACCT-sign-out`: Sign out of the system; `UC-ACCT-use-anonymously`: Use the system without identification; `UC-ACCT-give-research-consent`: Consent to data linking for research; `UC-ACCT-withdraw-research-consent`: Withdraw prior research consent; `UC-ACCT-delete-my-data`: Delete my account data |
| `SAFE` | `FEAT-safety-escalation`: Safety Escalation (Candidate; `OI-SAFETY-ESCALATION`) | `UC-SAFE-respond-to-distress`: Get support resources when expressing distress |
| `GRAD` | `FEAT-d2l-grades-read`: D2L Grades (Postponed) | `UC-GRAD-import-grades`: Import grades from D2L |
| `TRAK` | `FEAT-assignment-tracker`: Assignment Tracker (Postponed) | `UC-TRAK-sync-assignment-deadlines`: Sync assignment deadlines |
| `NOTF` | `FEAT-notifications`: Notifications (Postponed) | `UC-NOTF-receive-study-reminder`: Receive a study reminder; `UC-NOTF-set-reminder-preferences`: Set reminder preferences |
| `GAME` | `FEAT-leaderboard`, `FEAT-streak`: Leaderboard / Streak (Postponed) | `UC-GAME-view-study-streak`: View a study streak; `UC-GAME-view-class-leaderboard`: View the class leaderboard |

### 3.1 Specification Status and Dependencies

`UC-BNCH-complete-baseline-assessment` is specified in Section 4. All other entries above are inventory records awaiting their own full Section 4 specifications; their identifiers and scope classifications are retained here so they can be reviewed and traced without inventing unapproved behavior.

- `UC-BNCH-retake-baseline-assessment` depends on the unresolved retake decision in `UC-BNCH-complete-baseline-assessment`.
- `UC-CHAT-resume-conversation` requires persisted chat-history storage. `UC-CHAT-share-problem-image` accepts JPEG or PNG images up to 2 MB, 4096 px on either side, and 12 MP; no more than two images are retained in recent context.
- `UC-GRND-add-course-material` depends on `AS-training-data`. `UC-TIME-run-study-session` must restore state after refresh (`ROB-study-session`). `UC-LOG-view-study-history` must show a saved session within two seconds (`PER-study-log`).
- `UC-LOG-log-study-session` awaits `OI-STUDY-METHODS`. `UC-REFL-reflect-after-assessment` uses self-reported results because D2L grade import is postponed.
- Account use cases also depend on the stated security and consent decisions: `SEC-authentication`, `SEC-grade-consent`, `BR-student-information-confidentiality`, and the applicable `OI-*` entries. `UC-GAME-view-class-leaderboard` additionally requires confirmation of `BR-leaderboard-professor-only`.

---

## 4. Use Cases

### UC-BNCH-complete-baseline-assessment: The student completes a baseline assessment

**UC ID and Name:** `UC-BNCH-complete-baseline-assessment`: Complete a baseline assessment
**Created By:** Team 4
**Date Created:** 2026-09-18
**Primary Actor:** student
**Secondary Actors:** none
**Trigger:** The student selects the option to begin the baseline assessment during or after onboarding.
**Description:** The student completes an initial assessment so that the system records the student's current study habits and preferences and can enable a default study session based on their input.

**Preconditions:**

- PRE-1. The student can access the application.
- PRE-2. The baseline assessment is available.

**Postconditions:**

- POST-1. The student's baseline responses are stored and associated with the student.
- POST-2. The baseline assessment is marked complete for the student.

**Main Success Scenario:**

1. The student selects the option to begin the baseline assessment.
2. The system retrieves the assessment questions and displays an explanation of the assessment.
3. The student begins the assessment.
4. The system presents a question about the student's current study habits or preferences.
5. The student answers the question.
6. The system records the response and presents the next question.
7. The student repeats steps 5 and 6 until all questions are answered.
8. The system displays the completed assessment for review and submission.
9. The student submits the completed assessment.
10. The system validates the required responses.
11. The system stores the validated responses, associates them with the student, marks the assessment complete, and confirms completion to the student.
12. Use case ends.

**Extensions:**

- **10a. A required response is missing:**
    - 10a1. The system identifies the unanswered question or questions and asks the student to complete them.
    - 10a2. The student provides the missing response or responses.
    - 10a3. The flow rejoins at step 10.
- **11a. The system cannot save the responses:**
    - 11a1. The system informs the student that the assessment could not be saved and preserves the entered responses for another attempt where feasible.
    - 11a2. The student retries submission or terminates the use case.

**Priority:** High
**Frequency of Use:** Primarily once per student; whether retakes are allowed is not yet determined.
**Business Rules:** none

**Associated Information:**

| Property name | Data type | Validation rule | Security or access concerns | Glossary reference |
|---|---|---|---|---|
| baseline response | Selection or text | Required for required assessment questions | Visible only to the student and authorized system functions | Study habits |
| assessment completion status | Boolean | Set to complete only after all required responses are successfully stored | Student-specific; not editable by other students | Baseline assessment |

The assessment focuses on study behavior rather than chemistry knowledge. Questions may cover preferred study times, session lengths, study methods, print versus digital study, and office-hours use. If persistence fails, the assessment is not marked complete; entered responses are preserved for a retry where feasible.

**Related Use Cases:** none
**Assumptions:** The baseline assessment is available at the start of the student's use of the application.
**Open Issues:** Is completion mandatory? Can students retake the assessment?

## UC-CHAT-work-through-problem — Work Through a Chemistry Problem

**Created By:** Team 4  
**Date Created:** November 19, 2026  
**Primary Actor:** Student  
**Secondary Actors:** AI Model Service

**Trigger:** The student submits a chemistry problem or requests help solving one through the chat interface.

**Description:** The student works through a General Chemistry problem with guidance from the AI coach. Rather than immediately providing the solution, the system encourages the student to explain their understanding, identify relevant concepts, and determine the next steps. The AI coach is not allowed to provide the student with a direct solution. 

### Preconditions
- **PRE-1.** The chat interface is accessible to the student.
- **PRE-2.** The AI coaching service is configured and available to receive requests.

### Postconditions
- **POST-1.** The system displays a coaching response relevant to the student's chemistry problem.
- **POST-2.** The conversation contains the student's submitted problem and the AI coach's response in the active session.
- **POST-3.** The student can continue the conversation to work through subsequent steps.

### Main Success Scenario
1. The student opens the chat interface.
2. The system displays the active conversation and message input.
3. The student enters a chemistry problem and submits it.
4. The system validates the input and sends the problem with available conversation context to the AI coaching service.
5. The AI coaching service returns a response that guides the student's reasoning without immediately providing the complete solution.
6. The system displays the coaching response.
7. The student explains their reasoning or proposes the next step.
8. The system sends the student's response and available conversation context to the AI coaching service.
9. The AI coaching service evaluates the student's reasoning and returns targeted guidance or a follow-up question.
10. The system displays the guidance, allowing the student to continue working toward a solution.

### Extensions
**3a. Empty message — Exception**
- **3a1.** The system detects that the message contains no meaningful content.
- **3a2.** The system does not submit the request to the AI service.
- **3a3.** The system prompts the student to enter a question or problem.
- **3a4.** The flow returns to step 3.

**4a. AI service unavailable — Exception**
- **4a1.** The system detects a service error or timeout.
- **4a2.** The system displays an error indicating that coaching is temporarily unavailable.
- **4a3.** The system retains the student's entered problem in the current interface where possible.
- **4a4.** The student may retry from step 3.

**5a. Student requests complete answer — Alternative flow**
- **5a1.** The AI coach recognizes the request for a direct solution.
- **5a2.** The AI coach redirects the interaction toward identifying what the student knows and which step to attempt next.
- **5a3.** The flow rejoins at step 6.

**7a. Student expresses uncertainty — Alternative flow**
- **7a1.** The student indicates that they do not know how to proceed.
- **7a2.** The system forwards the response to the AI coach.
- **7a3.** The AI coach provides a smaller guiding question or conceptual hint.
- **7a4.** The flow rejoins at step 10.

**7b. Student stops participating — Alternative flow**
- **7b1.** The student leaves the conversation or stops responding.
- **7b2.** The current interaction ends without requiring the student to complete the problem.
- **7b3.** Conversation retention depends on the confirmed session-storage design.

### Priority
**High** — Core educational functionality.

### Frequency of Use
Estimated multiple times per study session, potentially several times per week per active student.

### Business Rules
- `BR-no-direct-answers` (identifier to verify against `business-rules.md`).

### Associated Information
| Property name | Data type | Validation rule | Security or access concerns | Glossary reference |
|---|---|---|---|---|
| Conversation ID | String / UUID | Required if conversations are persistently identified; unique | Authorized session/user only | Conversation |
| Student message | String | Required; nonempty after trimming | Treat as untrusted input | Student Message |
| AI response | String | Required for successful response | Display only in appropriate conversation | Coaching Response |
| Conversation context | Array of messages | Valid roles and content | Do not expose other students' conversations | Conversation Context |
| Message timestamp | DateTime | Valid timestamp if recorded | Subject to retention policy | Message Timestamp |

**Quality attributes:** Understandable guidance, graceful AI failures, and continuity in the active session.

**Display strategy:** Chronological messages with clear distinction between student and AI.

**Systemic failure handling:** A failed AI request is not displayed as successful. Whether messages persist before or after successful processing remains a storage decision.

### Related Use Cases
- `UC-CHAT-check-own-answer` — Check Own Chemistry Answer
- `UC-CHAT-share-problem-image` — Share Chemistry Problem Image
- `UC-CHAT-start-new-conversation` — Start New Conversation

### Assumptions
- Students use a text-based chat interface.
- The AI receives sufficient context for multi-turn coaching.
- Coaching focuses on reasoning and reflection.
- Students may stop before completing a problem.

### Open Issues
- **OI-CHAT-01:** What are the maximum student message length and context limits?
- **OI-CHAT-02:** May students request full worked solutions in any circumstances?
- **OI-CHAT-03:** Are conversations stored permanently, temporarily, or only for the session?
- **OI-CHAT-04:** What AI response-time or timeout threshold is required?

---

## UC-CHAT-check-own-answer — Check Own Chemistry Answer

**Created By:** Team 4
**Date Created:** November 19, 2026  
**Primary Actor:** Student  
**Secondary Actors:** AI Model Service

**Trigger:** The student submits a chemistry problem with an attempted answer and requests feedback.

**Description:** The student uses the AI coach to evaluate an attempted answer. The system offers feedback on reasoning, identifies possible misconceptions, and encourages reflection and correction rather than merely revealing a solution.

### Preconditions
- **PRE-1.** The chat interface is accessible to the student.
- **PRE-2.** The AI coaching service is configured and available to receive requests.

### Postconditions
- **POST-1.** The system displays feedback addressing the attempted answer.
- **POST-2.** The answer and feedback appear in the active conversation.
- **POST-3.** The student can revise the answer or continue discussing their reasoning.

### Main Success Scenario
1. The student opens the chat interface.
2. The system displays the active conversation and message input.
3. The student submits a chemistry problem, attempted answer, and feedback request.
4. The system validates the message and sends relevant information to the AI coaching service.
5. The AI coaching service examines the answer and available reasoning.
6. The system displays feedback indicating whether the answer appears correct, incorrect, or requires clarification, with coaching guidance.
7. The student reviews the feedback and submits a revision or explanation.
8. The system forwards the student's response to the AI coaching service.
9. The AI coaching service evaluates the revision and returns guidance.
10. The system displays the feedback to help the student identify improvements.

### Extensions
**3a. Answer without original problem — Alternative flow**
- **3a1.** The system accepts the message.
- **3a2.** The AI coach determines whether available context is sufficient.
- **3a3.** If insufficient, the AI coach requests the problem or additional information.
- **3a4.** The system displays the clarification request.
- **3a5.** The student supplies the missing information and returns to step 3.

**3b. Empty message — Exception**
- **3b1.** The system detects the empty message.
- **3b2.** The system prompts for an answer or question.
- **3b3.** The flow returns to step 3.

**4a. AI service unavailable — Exception**
- **4a1.** The system detects a timeout or service failure.
- **4a2.** The system informs the student that feedback is unavailable.
- **4a3.** The student may retry.
- **4a4.** The flow returns to step 3 on retry.

**5a. Correct answer — Alternative flow**
- **5a1.** The AI coach identifies the answer as correct based on available information.
- **5a2.** The AI coach reinforces relevant concepts and asks about the reasoning.
- **5a3.** The flow rejoins at step 6.

**5b. Incorrect answer — Alternative flow**
- **5b1.** The AI coach identifies a likely error or misconception.
- **5b2.** The AI coach provides a targeted hint or question.
- **5b3.** The flow rejoins at step 6.

**5c. Uncertain evaluation — Alternative flow**
- **5c1.** The AI coach identifies ambiguity or missing information.
- **5c2.** The AI coach requests clarification instead of asserting correctness.
- **5c3.** The system displays the request at step 6.
- **5c4.** The student clarifies at step 7.

**7a. Student does not revise — Alternative flow**
- **7a1.** The student ends the interaction.
- **7a2.** The use case concludes with feedback displayed.
- **7a3.** No additional AI request is made.

### Priority
**High** — Supports reflection and learning from mistakes.

### Frequency of Use
Estimated several times per study session, especially during homework and exam preparation.

### Business Rules
- `BR-no-direct-answers` (identifier to verify).

### Associated Information
| Property name | Data type | Validation rule | Security or access concerns | Glossary reference |
|---|---|---|---|---|
| Conversation ID | String / UUID | Required if persistent identifiers are used | Authorized session/user only | Conversation |
| Chemistry problem | String | Sufficient context; may come from earlier messages | Protect student content | Chemistry Problem |
| Attempted answer | String | Nonempty; format varies by problem | Appropriate conversation only | Attempted Answer |
| Student reasoning | String | Optional; may be requested | Protect student content | Student Reasoning |
| AI feedback | String | Required on success | Appropriate conversation only | Coaching Feedback |
| Revised answer | String | Optional; nonempty if submitted | Same access restrictions | Revised Answer |
| Message timestamp | DateTime | Valid if recorded | Subject to retention policy | Message Timestamp |

**Quality attributes:** Understandable, relevant, and appropriately cautious feedback.

**Display strategy:** Feedback appears after the student's submission in chronological order.

**Systemic failure handling:** Do not fabricate correctness feedback on service failure. Persistence and rollback depend on the storage architecture.

### Related Use Cases
- `UC-CHAT-work-through-problem` — Work Through a Chemistry Problem
- `UC-CHAT-share-problem-image` — Share Chemistry Problem Image
- `UC-CHAT-start-new-conversation` — Start New Conversation

### Assumptions
- Students can submit attempted answers through chat.
- AI evaluations are not guaranteed to be correct.
- Feedback develops understanding rather than assigning formal grades.
- No gradebook integration is required.

### Open Issues
- **OI-CHAT-05:** Should AI explicitly state correctness or guide self-assessment?
- **OI-CHAT-06:** Should structured math notation, equations, and units be supported?
- **OI-CHAT-07:** Should revisions be tracked separately or only as messages?
- **OI-CHAT-08:** How should ambiguous or unverifiable answers be handled?

---

## UC-CHAT-share-problem-image — Share Chemistry Problem Image

**Created By:** Team 4
**Date Created:** November 19, 2026  
**Primary Actor:** Student  
**Secondary Actors:** AI Model Service; Image Processing Service (if separate)

**Trigger:** The student selects an image of a chemistry problem to share in chat.

**Description:** The student uploads a photographed or saved chemistry problem. The system processes recognizable contents and makes them available to the AI coach so the student can receive guidance without manually transcribing the problem. This is intended behavior, not a verified implementation.

### Preconditions
- **PRE-1.** The student can access the chat interface.
- **PRE-2.** Image upload is enabled and configured.
- **PRE-3.** The configured AI or image-processing service is available to accept image inputs.

### Postconditions
- **POST-1.** The selected image is associated with the active conversation for the interaction.
- **POST-2.** The system displays the image or an attachment representation.
- **POST-3.** The AI coach displays a response based on recognizable content or requests clarification.
- **POST-4.** The student can continue discussing the problem.

### Main Success Scenario
1. The student opens the chat interface.
2. The system displays the conversation and image-attachment control.
3. The student selects the image-attachment control.
4. The system opens the supported file-selection interface.
5. The student selects an image containing a chemistry problem.
6. The system validates the image file type and size.
7. The system displays an attachment preview.
8. The student submits the image with optional text.
9. The system sends the image and accompanying text to the configured service.
10. The AI service interprets recognizable chemistry content and generates coaching guidance.
11. The system displays the image and coaching response.
12. The student continues working through the problem with the coach.

### Extensions
**5a. File selection canceled — Alternative flow**
- **5a1.** The student closes file selection without choosing an image.
- **5a2.** The system returns to chat without an attachment.
- **5a3.** The use case ends without changing the conversation.

**6a. Unsupported format — Exception**
- **6a1.** The system detects an unsupported file type.
- **6a2.** The system displays accepted formats.
- **6a3.** The system rejects the file.
- **6a4.** The student may return to step 5.

**6b. Oversized file — Exception**
- **6b1.** The system detects a file above the configured limit.
- **6b2.** The system explains the size restriction.
- **6b3.** The system rejects the file.
- **6b4.** The student may return to step 5.

**7a. Attachment removed before submission — Alternative flow**
- **7a1.** The student removes the selected image.
- **7a2.** The system clears the preview.
- **7a3.** The student may return to step 3 or end the use case.

**9a. Transmission or processing fails — Exception**
- **9a1.** The system detects an upload failure, service error, or timeout.
- **9a2.** The system displays a processing error.
- **9a3.** The system does not display a successful processing result.
- **9a4.** The student may retry from step 8.

**10a. Image unclear — Alternative flow**
- **10a1.** The AI service cannot reliably read some or all content.
- **10a2.** The AI requests a clearer image or textual clarification.
- **10a3.** The system displays the request at step 11.
- **10a4.** The student supplies clarification and returns to step 8.

**10b. Multiple problems in image — Alternative flow**
- **10b1.** The AI coach identifies multiple possible questions.
- **10b2.** The AI asks which one to discuss.
- **10b3.** The system displays the question at step 11.
- **10b4.** The student identifies the intended problem at step 12.

### Priority
**Medium (provisional)** — Useful but dependent on image-processing capabilities.

### Frequency of Use
Estimated one to several times per study session for students using printed or handwritten materials.

### Business Rules
- `BR-no-direct-answers` (identifier to verify; applies to image-based coaching).

### Associated Information
| Property name | Data type | Validation rule | Security or access concerns | Glossary reference |
|---|---|---|---|---|
| Conversation ID | String / UUID | Required if persistently identified | Authorized session/user only | Conversation |
| Image file | Binary / File | Required; within supported type and size limits | Treat as untrusted upload | Problem Image |
| Image MIME type | String | Supported format; validate content, not filename alone | Prevent malicious uploads | File Type |
| Image size | Integer | Positive and within configured maximum | Enforce resource limits | File Size |
| Image attachment ID | String / UUID | Unique if stored/tracked | Prevent unauthorized access | Attachment |
| Accompanying text | String | Optional; nonempty if provided | Same restrictions as chat | Student Message |
| AI response | String | Required on successful coaching | Appropriate conversation only | Coaching Response |
| Upload timestamp | DateTime | Valid if recorded | Subject to retention policy | Upload Timestamp |

**Quality attributes:** Reliable validation, understandable errors, and cautious interpretation of unreadable notation.

**Display strategy:** Show the image alongside its message in chronological order, with a preview before submission.

**Systemic failure handling:** Reject invalid files before processing. Never report failed uploads or AI requests as successful. Storage and cleanup policies remain undecided.

### Related Use Cases
- `UC-CHAT-work-through-problem` — Work Through a Chemistry Problem
- `UC-CHAT-check-own-answer` — Check Own Chemistry Answer
- `UC-CHAT-start-new-conversation` — Start New Conversation

### Assumptions
- Students select existing images from their devices.
- A vision-capable model or service interprets image contents.
- Images may include printed or handwritten text, equations, and diagrams.
- Some images cannot be interpreted reliably.
- Image-based coaching follows the same metacognitive principles as text chat.

### Open Issues
- **OI-CHAT-09:** Which image formats are supported?
- **OI-CHAT-10:** What is the maximum image size?
- **OI-CHAT-11:** Will the existing model, a vision model, or another service process images?
- **OI-CHAT-12:** Are images stored, and for how long?
- **OI-CHAT-13:** Are multiple images per message supported?
- **OI-CHAT-14:** Is direct camera capture required or only file selection?
- **OI-CHAT-15:** How should images containing identifying or sensitive information be handled?

---

## UC-CHAT-start-new-conversation — Start New Conversation

**Created By:** Team 4
**Date Created:** November 19, 2026  
**Primary Actor:** Student  
**Secondary Actors:** None

**Trigger:** The student selects the option to start a new conversation.

**Description:** The student starts a separate conversation with the AI coach without carrying previous messages into the new conversation's active context.

### Preconditions
- **PRE-1.** The student can access the chat interface.
- **PRE-2.** The interface provides an enabled new-conversation option.

### Postconditions
- **POST-1.** The system displays an empty conversation ready for input.
- **POST-2.** Previous conversation messages are excluded from the new active context.
- **POST-3.** The student can submit a new message without continuing the previous conversation.
- **POST-4.** Previous conversation retention follows the configured storage policy.

### Main Success Scenario
1. The student opens the chat interface.
2. The system displays the active conversation or an empty chat.
3. The student selects "New Conversation."
4. The system initializes a new conversation state separate from the previous one.
5. The system clears previous messages from the active chat display.
6. The system displays an empty conversation and message input.
7. The student enters a new chemistry question or problem.
8. The system validates the input and sends it to the AI service without previous conversation messages as active context.
9. The AI coaching service generates a response.
10. The system displays the response in the new conversation.

### Extensions
**3a. Current conversation already empty — Alternative flow**
- **3a1.** The system determines that the active conversation has no messages.
- **3a2.** The system keeps the empty state instead of requiring another empty record.
- **3a3.** The flow rejoins at step 6.

**3b. Unsent text exists — Alternative flow**
- **3b1.** The system detects an unsent draft.
- **3b2.** The system follows the configured draft-handling policy.
- **3b3.** If confirmation is required, the system asks whether to discard the draft.
- **3b4.** If the student cancels, the system keeps the current conversation and ends the use case.
- **3b5.** If the student confirms, the flow rejoins at step 4.

**4a. Conversation initialization fails — Exception**
- **4a1.** The system detects initialization failure.
- **4a2.** The system displays an error.
- **4a3.** The system preserves the existing conversation where possible.
- **4a4.** The student may retry from step 3.

**7a. Student leaves before sending — Alternative flow**
- **7a1.** The student navigates away.
- **7a2.** The system follows its empty-conversation persistence policy.
- **7a3.** The use case ends without an AI request.

**8a. Empty message — Exception**
- **8a1.** The system detects empty input.
- **8a2.** The system prompts for a message.
- **8a3.** The flow returns to step 7.

**8b. AI service unavailable — Exception**
- **8b1.** The system detects a service error or timeout.
- **8b2.** The system displays an error.
- **8b3.** The new conversation remains active.
- **8b4.** The student may retry from step 7.

### Priority
**High** — Basic chat separation and context isolation.

### Frequency of Use
Estimated one to several times per study session.

### Business Rules
No verified rule identifier specifically governs starting a new conversation.

### Associated Information
| Property name | Data type | Validation rule | Security or access concerns | Glossary reference |
|---|---|---|---|---|
| Conversation ID | String / UUID | Unique if persisted; may be assigned on first message | Authorized session/user only | Conversation |
| Session/User ID | String / UUID | Valid if session/account association is used | Prevent cross-user access | User Session |
| Conversation creation time | DateTime | Valid if recorded | Subject to retention policy | Conversation Timestamp |
| Conversation messages | Array of messages | Initially empty | Isolated from other conversations | Conversation History |
| Active conversation ID | String / UUID / Null | References a valid active conversation when assigned | Prevent unauthorized selection | Active Conversation |
| Unsent draft | String | Optional; follow draft policy | Do not transfer unintentionally | Message Draft |

**Quality attributes:** Responsive transition and isolation of prior conversation context.

**Display strategy:** Show an empty message area and input field; history navigation is not assumed.

**Systemic failure handling:** Do not report a saved conversation if creation fails. Preserve previous conversation where possible. Rollback depends on whether records are created immediately or on the first message.

### Related Use Cases
- `UC-CHAT-work-through-problem` — Work Through a Chemistry Problem
- `UC-CHAT-check-own-answer` — Check Own Chemistry Answer
- `UC-CHAT-share-problem-image` — Share Chemistry Problem Image

### Assumptions
- Students can initiate separate conversations.
- New conversations exclude previous messages from active context.
- Starting a new conversation does not automatically delete the previous one.
- Authentication is not necessarily required.
- Persistence may differ between authenticated and unauthenticated students.
- Empty conversations may exist only in frontend state until the first message.

### Open Issues
- **OI-CHAT-16:** Create a conversation immediately or on the first message?
- **OI-CHAT-17:** Should students access prior conversations through history?
- **OI-CHAT-18:** Can unauthenticated students retain conversations across sessions?
- **OI-CHAT-19:** Confirm before discarding unsent text?
- **OI-CHAT-20:** How should titles be generated, if required?
- **OI-CHAT-21:** What happens to an in-progress AI response when a new conversation starts?
