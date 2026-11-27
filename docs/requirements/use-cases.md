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
| 2026-11-20 | 0.4 | Applied the client's answers to `BNCH`: the baseline assessment is mandatory, one-time, covers study habits and chemistry knowledge, and uses questions the instructor provides to the team. Revised `UC-BNCH-complete-baseline-assessment` and `UC-BNCH-view-baseline-results`; added `UC-BNCH-view-class-baseline-results` and `UC-BNCH-view-common-terms`; withdrew `UC-BNCH-retake-baseline-assessment`. | Amarachi Chiemela, Sam Shema |

---

## 1. Introduction

### 1.1 Purpose

_[One paragraph: this document specifies the goals users can accomplish with the system, in enough detail that a developer knows what to build and a tester knows what to check.]_

This document identifies the user goals supported by the Gen Chem Metacognition Study Assistant. The use-case list is the authoritative inventory of stable use-case identifiers; each detailed specification defines the normal flow, failure paths, data, and rules needed to implement and test that goal. Items awaiting a client or architecture decision remain in the list with their dependency stated rather than being treated as approved requirements.

### 1.2 Scope

_[Which feature areas from the vision and scope are covered here. Name the `FEAT-*` entries. If a feature has no use cases yet, say so rather than leaving the reader to notice.]_

This document covers the MVP feature areas `FEAT-benchmark-quiz`, `FEAT-guided-chatbot`, `FEAT-course-grounding`, `FEAT-pomodoro-timer`, `FEAT-study-session-log`, and `FEAT-reflection`; the candidate areas `FEAT-chat-modes`, `FEAT-study-planning`, `FEAT-account-consent`, and `FEAT-safety-escalation`; and the postponed areas `FEAT-d2l-grades-read`, `FEAT-assignment-tracker`, `FEAT-notifications`, `FEAT-leaderboard`, and `FEAT-streak`. Candidate and postponed entries reserve identifiers but are not committed MVP work.

### 1.3 Inventory Decisions and Open Items

- The client asked for an instructor (admin) view of baseline results and of common terms in students' responses. Those use cases belong to `FEAT-benchmark-quiz` and are specified under `BNCH`. Any broader instructor view still has no feature and stays excluded; an `INST` area must not be added without one.
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
| `BNCH` | `FEAT-benchmark-quiz`: Benchmark Quiz (MVP) | `UC-BNCH-complete-baseline-assessment`: Complete a baseline assessment; `UC-BNCH-view-baseline-results`: View my baseline and growth over time; `UC-BNCH-view-class-baseline-results`: View the class's baseline results; `UC-BNCH-view-common-terms`: View common terms in students' responses; `UC-BNCH-retake-baseline-assessment`: _withdrawn 2026-11-20, the assessment is one-time_ |
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

The four active `BNCH` use cases and the `CHAT` use cases with a heading in Section 4 are specified there. All other entries above are inventory records awaiting their own full Section 4 specifications; their identifiers and scope classifications are retained here so they can be reviewed and traced without inventing unapproved behavior.

- `UC-BNCH-retake-baseline-assessment` is withdrawn: the client confirmed the assessment is one-time. Its identifier is kept so it is never reused.
- The instructor use cases `UC-BNCH-view-class-baseline-results` and `UC-BNCH-view-common-terms` need instructor sign-in, which no account use case covers yet (`OI-INSTRUCTOR-SIGN-IN`).
- `UC-CHAT-resume-conversation` requires persisted chat-history storage. `UC-CHAT-share-problem-image` accepts JPEG or PNG images up to 2 MB, 4096 px on either side, and 12 MP; no more than two images are retained in recent context.
- `UC-GRND-add-course-material` depends on `AS-training-data`. `UC-TIME-run-study-session` must restore state after refresh (`ROB-study-session`). `UC-LOG-view-study-history` must show a saved session within two seconds (`PER-study-log`).
- `UC-LOG-log-study-session` awaits `OI-STUDY-METHODS`. `UC-REFL-reflect-after-assessment` uses self-reported results because D2L grade import is postponed.
- Account use cases also depend on the stated security and consent decisions: `SEC-authentication`, `SEC-grade-consent`, `BR-student-information-confidentiality`, and the applicable `OI-*` entries. `UC-GAME-view-class-leaderboard` additionally requires confirmation of `BR-leaderboard-professor-only`.

---

## 4. Use Cases

### UC-BNCH-complete-baseline-assessment: The student completes a baseline assessment

**UC ID and Name:** `UC-BNCH-complete-baseline-assessment`: Complete a baseline assessment
**Created By:** Team 4 (Amarachi Chiemela, Sam Shema)
**Date Created:** 2026-09-18 (revised 2026-11-20 from the client's answers)
**Primary Actor:** student
**Secondary Actors:** none
**Trigger:** The student opens the application for the first time after signing up.
**Description:** Before using the rest of the application, the student takes a one-time baseline assessment with two parts, their current study habits and their general chemistry knowledge. The instructor provides the questions and the team includes them in the application. The system records the result as the student's baseline, so the coach can pitch its guiding questions at the student's level and the student can later see their growth against it.

**Preconditions:**

- PRE-1. The student has signed up and is signed in.
- PRE-2. The student has no completed baseline assessment.
- PRE-3. The application includes the question set the instructor provided to the team.

**Postconditions:**

- POST-1. The student's validated responses are stored and associated with the student, together with the version of the question set they answered.
- POST-2. The student's baseline is stored: their study-habit answers and a knowledge level per chemistry topic, scored from their knowledge answers.
- POST-3. The student's choice about showing their name to the instructor is stored.
- POST-4. The baseline assessment is marked complete for the student, with the date it was completed, and the student can use the rest of the application.
- POST-5. POST-1 to POST-4 are all true or none is: a failed submission stores nothing and leaves the student not complete.

**Main Success Scenario:**

1. The student opens the application for the first time after signing up.
2. The system shows that the baseline assessment is required before continuing and explains it: a one-time, ungraded assessment with a study-habits part and a general chemistry part; it has no effect on the course grade; "I'm not sure" is an acceptable answer to a chemistry question; and the coach uses the result to match its questions to what the student already knows.
3. The system asks whether the student allows the instructor to see their name with their results, explaining that otherwise the instructor sees them anonymously.
4. The student chooses yes or no.
5. The student begins the assessment.
6. The system presents a question from the question set, with its answer options and its position in the assessment (for example, "Question 3 of 12"). A chemistry question also offers "I'm not sure".
7. The student answers the question.
8. The system keeps the response in the in-progress assessment, without showing whether a chemistry answer is correct, and presents the next question.
9. The student repeats steps 7 and 8 until all questions are answered.
10. The system displays the completed assessment for review, showing every question with the student's answer and the student's name-sharing choice.
11. The student submits the completed assessment.
12. The system validates the required responses.
13. The system scores the chemistry answers by topic, stores the responses, the baseline, and the name-sharing choice, marks the assessment complete, and confirms completion to the student.
14. The system lets the student into the application. The coach uses the baseline from the student's next conversation.
15. Use case ends.

**Extensions:**

- **2a. The student tries to skip the assessment or go to another page:**
    - 2a1. The system explains that the assessment is required first and returns the student to it.
- **2b. The questions cannot be loaded:**
    - 2b1. The system explains that the assessment is unavailable right now and offers to try again. Nothing is stored.
    - 2b2. Whether the student waits or may use the rest of the application meanwhile is open (see Open Issues).
- **2c. The student's session has expired:**
    - 2c1. The system asks the student to sign in again and returns them to step 2 afterwards.
- **4a. The student does not choose:**
    - 4a1. The system treats the choice as required and does not continue until the student chooses yes or no.
- **7a. The student chooses "I'm not sure" on a chemistry question:**
    - 7a1. The system records the response as not known, separately from a wrong answer, and the flow continues at step 8.
- **7b. The student skips an optional question:**
    - 7b1. The system records no response for that question and the flow continues at step 8.
- **7c. The student goes back to an earlier question:**
    - 7c1. The system shows the earlier question with the student's current answer, and the student may change it. The flow continues at step 8.
- **7d. A response is not one of the offered options, or a text answer is longer than allowed:**
    - 7d1. The system rejects it with a message explaining what is accepted and keeps the student on the question (`ROB-invalid-data`).
- **8a. The student leaves or closes the application before submitting:**
    - 8a1. Nothing is stored and the assessment remains not complete.
    - 8a2. The next time the student opens the application, the flow starts again at step 2.
- **10a. The student changes an answer or their name-sharing choice during review:**
    - 10a1. The system shows that question or choice again, the student changes it, and the flow returns to step 10.
- **11a. The student submits more than once** (for example, by double-clicking):
    - 11a1. The system processes one submission and stores one set of responses.
- **12a. A required response is missing:**
    - 12a1. The system identifies the unanswered question or questions and asks the student to complete them.
    - 12a2. The student provides the missing response or responses.
    - 12a3. The flow rejoins at step 12.
- **12b. The student's session expired before submission:**
    - 12b1. The system asks the student to sign in again, keeps the entered responses where feasible, and the flow rejoins at step 11.
- **12c. The student already completed the assessment** (for example, on another device):
    - 12c1. The system does not store a second set of responses or change the baseline, tells the student their assessment is already complete, and continues at step 14.
- **13a. The system cannot save the responses or calculate the baseline:**
    - 13a1. The system informs the student that the assessment could not be saved, stores nothing, and preserves the entered responses for another attempt where feasible (POST-5).
    - 13a2. The student retries submission or terminates the use case. The student stays at the assessment until it is saved.
- **14a. A student with a completed assessment opens the application:**
    - 14a1. The system does not show the assessment again and goes straight into the application. The assessment is one-time; there is no retake.

**Priority:** High
**Frequency of Use:** Once per student, on first opening the application after sign-up; about 185 students in the pilot course, mostly at the start of the semester.
**Business Rules:** `BR-student-information-confidentiality`, `BR-no-content-teaching`

**Associated Information:**

| Property name | Data type | Validation rule | Security or access concerns | Glossary reference |
|---|---|---|---|---|
| question | Text, part (study habits or chemistry), answer options; for chemistry, a topic and a correct option | Provided by the instructor and included in the application by the team | The correct option is never sent to the student's browser; chemistry answers are scored on the server | Benchmark Quiz |
| baseline response | One or more selected options, "not sure", or short text | Must match the question's options; required for required questions; short text has a maximum length | Visible to the student; visible to the instructor named or anonymously according to the name-sharing choice; never written to logs | Benchmark Quiz |
| name-sharing choice | Yes or no | Required | Set by the student; decides whether the instructor sees the student's name | — |
| baseline | Study-habit answers and a knowledge level per chemistry topic | Derived on the server only from the student's responses | Sent to the language model service with the student's coaching requests; visible to the instructor as the name-sharing choice allows | Benchmark Quiz |
| question-set version | Identifier | The version included in the application when the student started; changes only in a new release | — | — |
| assessment completion status and date | Boolean and date-time (UTC) | Set to complete only after the responses, baseline, and choice are stored together | Student-specific; checked every time the student opens the application | Benchmark Quiz |

The chemistry part calibrates the coach; it does not teach. The coach uses the baseline only to choose the level of its guiding questions, never to explain content or give answers (`BR-no-content-teaching`). Every request requires a signed-in student and reaches only that student's records (`SEC-authentication`, `SEC-student-isolation`); the instructor's access follows `SEC-instructor-visibility`. The submission is one transaction: if any part fails, nothing is stored and the assessment is not marked complete. The assessment should be short enough that a first-time student reaches their study plan within five minutes of finishing onboarding (`USE-study-plan`), and the page meets `USE-accessibility`. The [baseline assessment design-of-record](../design/design-of-record.md) predates this revision and must be revised before implementation.

**Related Use Cases:** `UC-ACCT-sign-in`, `UC-BNCH-view-baseline-results`, `UC-BNCH-view-class-baseline-results`, `UC-CHAT-work-through-problem` (uses the baseline)
**Assumptions:** Students answer on their own, without looking answers up; the "I'm not sure" option reduces guessing.
**Open Issues:**

- How does the coach use the baseline, for example how many topics and levels, and how the baseline is added to coaching requests? (`OI-BNCH-COACH-USE`)
- If the questions cannot be loaded (extension 2b), does the student wait, or use the rest of the application until they load?
- In what form will the instructor provide the questions, with the correct answer and topic for each chemistry question, and by when? (`OI-BNCH-QUESTIONS`)
- Can a student change their name-sharing choice later, and where?

---

### UC-BNCH-view-baseline-results: The student views their baseline and growth

**UC ID and Name:** `UC-BNCH-view-baseline-results`: View my baseline and growth over time
**Created By:** Team 4 (Amarachi Chiemela, Sam Shema)
**Date Created:** 2026-11-16 (revised 2026-11-20)
**Primary Actor:** student
**Secondary Actors:** none
**Trigger:** The student finishes the baseline assessment, or later chooses to view their baseline.
**Description:** The student sees where they started, in study habits and in chemistry knowledge by topic, and how they have grown since, so they can recognize their own progress.

**Preconditions:**

- PRE-1. The student is signed in.
- PRE-2. The student has a completed baseline assessment.

**Postconditions:**

- POST-1. The student has seen their own baseline, its date, and any growth measured since.
- POST-2. Nothing is changed.

**Main Success Scenario:**

1. The student chooses to view their baseline.
2. The system retrieves the student's baseline and any later measurements of the same topics and habits.
3. The system displays the baseline by topic and habit, with its date, and shows the change since the baseline over time, in neutral and encouraging language that presents it as progress, not a grade.
4. Use case ends.

**Extensions:**

- **2a. The student has not completed the assessment:**
    - 2a1. The system takes the student to `UC-BNCH-complete-baseline-assessment`, which is required first.
- **2b. There are no later measurements yet:**
    - 2b1. The system shows the baseline alone and explains that growth appears as the student keeps using the application.
- **2c. The results cannot be loaded:**
    - 2c1. The system explains that the results are unavailable right now and offers to try again. Nothing is changed.
- **2d. The student's session has expired:**
    - 2d1. The system asks the student to sign in again and returns them to step 2 afterwards.
- **3a. The question set has changed since the student answered:**
    - 3a1. The system shows the baseline as the student answered it, not the current questions.

**Priority:** Medium
**Frequency of Use:** Once after completing the assessment, then occasionally, for example after an exam.
**Business Rules:** `BR-student-information-confidentiality`

**Associated Information:**

| Property name | Data type | Validation rule | Security or access concerns | Glossary reference |
|---|---|---|---|---|
| baseline | As in `UC-BNCH-complete-baseline-assessment` | Read only | The student sees only their own (`SEC-student-isolation`) | Benchmark Quiz |
| later measurement | Same topics and habits as the baseline, with a date | Source not yet decided (see Open Issues) | Student-specific | — |

The view never ranks the student or compares them with other students, consistent with the client's goal that students recognize their own patterns without feeling judged (`BO-self-reflection`, `BO-study-awareness`). It does not reveal the correct answers to the chemistry questions.

**Related Use Cases:** `UC-BNCH-complete-baseline-assessment`
**Assumptions:** The view is reachable within three clicks of the dashboard (`USE-core-navigation`).
**Open Issues:**

- The assessment is one-time, so where do the later measurements that show growth come from: study sessions, reflections, Coach conversations, or short periodic check-ins? (`OI-BNCH-GROWTH`)
- Where does the view live: on the Progress page, or in a separate profile view?

---

### UC-BNCH-view-class-baseline-results: The instructor views the class's baseline results

**UC ID and Name:** `UC-BNCH-view-class-baseline-results`: View the class's baseline results
**Created By:** Team 4 (Amarachi Chiemela, Sam Shema)
**Date Created:** 2026-11-20
**Primary Actor:** instructor
**Secondary Actors:** none
**Trigger:** The instructor wants to see where her students are starting from.
**Description:** The instructor sees the class's baseline results in the admin view, with the names of only the students who agreed to show them, so she understands her students' starting habits and knowledge while respecting each student's choice.

**Preconditions:**

- PRE-1. The instructor is signed in with instructor access.

**Postconditions:**

- POST-1. The instructor has seen class-level results and each student's results, named only where the student agreed.
- POST-2. Nothing is changed.

**Main Success Scenario:**

1. The instructor opens the class's baseline results in the admin view.
2. The system retrieves every completed baseline assessment for the course.
3. The system displays class-level results: the number of students who completed the assessment, the spread of study-habit answers, and the average knowledge level per chemistry topic.
4. The system lists each student's results, showing the student's name if they chose to share it and an anonymous label otherwise.
5. The instructor opens one student's results.
6. The system shows that student's answers and knowledge levels, under the same naming rule.
7. Use case ends.

**Extensions:**

- **1a. Someone without instructor access opens the results:**
    - 1a1. The system refuses access and shows no results.
- **2a. No student has completed the assessment yet:**
    - 2a1. The system says so and shows no results.
- **2b. The results cannot be loaded:**
    - 2b1. The system explains that the results are unavailable right now and offers to try again.
- **3a. Students answered different versions of the question set:**
    - 3a1. The system groups results by version, or shows only questions common to the versions, so that answers to different questions are not combined.
- **4a. So few students are anonymous that one could be identified:**
    - 4a1. How the system protects them is open (see Open Issues).

**Priority:** Medium
**Frequency of Use:** A few times per semester, mostly after most students have signed up.
**Business Rules:** `BR-student-information-confidentiality`

**Associated Information:**

| Property name | Data type | Validation rule | Security or access concerns | Glossary reference |
|---|---|---|---|---|
| student label | Name or anonymous label | The name appears only if the student's name-sharing choice is yes | Instructor only | — |
| class-level results | Counts and averages | Calculated from completed assessments only | Instructor only | Benchmark Quiz |

The anonymous label is stable, so the instructor can follow one anonymous student's results without learning who they are. Access follows `SEC-instructor-visibility`; students never see other students' results (`SEC-student-isolation`).

**Related Use Cases:** `UC-BNCH-complete-baseline-assessment`, `UC-BNCH-view-common-terms`
**Assumptions:** The pilot has one course and one instructor.
**Open Issues:**

- Should the instructor also see each student's growth since the baseline, or only the baseline?
- How are anonymous students protected when only a few students are anonymous (extension 4a)?

---

### UC-BNCH-view-common-terms: The instructor views common terms in students' responses

**UC ID and Name:** `UC-BNCH-view-common-terms`: View common terms in students' responses
**Created By:** Team 4 (Amarachi Chiemela, Sam Shema)
**Date Created:** 2026-11-20
**Primary Actor:** instructor
**Secondary Actors:** Language model service (Gemma on Cloudflare Workers AI)
**Trigger:** The instructor wants to know what her students commonly say about how they study and what they find hard.
**Description:** The coach pulls out the terms and themes that come up most often in students' own words, and the instructor sees them in the admin view, so she can spot shared habits and difficulties without reading every response.

**Preconditions:**

- PRE-1. The instructor is signed in with instructor access.

**Postconditions:**

- POST-1. The instructor has seen the most common terms and themes, with how often each appears.
- POST-2. No term is attributed to an individual student.

**Main Success Scenario:**

1. The instructor opens common terms in the admin view.
2. The system collects the students' text responses for the selected period.
3. The system asks the language model service to group them into common terms and themes.
4. The system displays the terms and themes, most frequent first, with how often each appears.
5. Use case ends.

**Extensions:**

- **1a. Someone without instructor access opens common terms:**
    - 1a1. The system refuses access and shows nothing.
- **2a. There are too few responses to show common terms:**
    - 2a1. The system says so and shows nothing.
- **3a. The language model service is unavailable, times out, or its allowance is exhausted:**
    - 3a1. The system explains that common terms are unavailable right now and offers to try again (`ROB-external-service`).
- **3b. The model's output names or quotes an identifiable student:**
    - 3b1. The system does not show that term (POST-2).
- **4a. The instructor selects a term:**
    - 4a1. How much detail the system shows, for example anonymized example phrases, is open (see Open Issues).

**Priority:** Low
**Frequency of Use:** Occasionally, for example after the first exam.
**Business Rules:** `BR-student-information-confidentiality`

**Associated Information:**

Student text is sent to the language model service to find common terms, so it leaves the application; this needs the same privacy approval as coaching requests (`OI-PRIVACY`). Terms are shown only in aggregate. The result may be generated again each time or stored; if it is stored, it is refreshed when new responses arrive.

**Related Use Cases:** `UC-BNCH-view-class-baseline-results`, `UC-BNCH-complete-baseline-assessment`
**Assumptions:** Enough students answer in their own words for patterns to appear.
**Open Issues:**

- Which responses are included: only text answers in the baseline assessment, or also Coach conversations? Coach conversations are not stored today, so including them needs chat-history storage first (`OI-BNCH-COMMON-TERMS`).
- Does this belong in `BNCH` if it includes Coach conversations? If so, it may need its own area and feature.
- What is the minimum number of responses before terms are shown, and can the instructor see example phrases?

---

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

**Description:** The signed-in student starts a separate saved conversation without carrying previous messages into its model context. Confirmed by Victor on November 27, 2026: discard unsent drafts on chat changes, let in-flight replies finish in their original chats, and let Gemma generate chat titles.

### Preconditions
- **PRE-1.** The student has an authenticated account and can access the saved-chat interface.
- **PRE-2.** The interface provides an enabled new-conversation option.

### Postconditions
- **POST-1.** The system displays an empty conversation ready for input.
- **POST-2.** Previous conversation messages are excluded from the new active context.
- **POST-3.** The student can submit a new message without continuing the previous conversation.
- **POST-4.** Previous conversation retention follows the configured storage policy.

### Main Success Scenario
1. The student opens the chat interface.
2. The system displays the active conversation or an empty chat.
3. The student selects "New chat."
4. The system initializes a new conversation state separate from the previous one.
5. The system clears previous messages from the active chat display.
6. The system displays an empty conversation and message input.
7. The student enters a new chemistry question or problem.
8. The system validates the input and atomically saves the owned conversation, pending turn, user message, and attachment metadata on first submission. Empty chats create no database record. Image bytes must be saved before requesting coaching for that image.
9. The AI coaching service generates a response without previous conversation messages as active context.
10. The system saves the accepted reply before displaying it. Gemma generates a short title; title failure leaves the usable fallback "New chat".
11. The conversation becomes available in the student's history. It and its images expire fourteen days after its last saved message.

### Extensions
**3a. Current conversation already empty — Alternative flow**
- **3a1.** The system determines that the active conversation has no messages.
- **3a2.** The system keeps the empty state instead of requiring another empty record.
- **3a3.** The flow rejoins at step 6.

**3b. Unsent text exists — Alternative flow**
- **3b1.** The system discards unsent text and image selections without confirmation.
- **3b2.** The flow rejoins at step 4. Previously saved messages are retained.

**3c. A response is running — Alternative flow**
- **3c1.** The student may still start a new chat or select another saved chat.
- **3c2.** The response continues and is saved only in its original conversation. It cannot replace the selected chat's contents.

**4a. Conversation initialization fails — Exception**
- Conversation IDs are prepared on first submission at step 8. A local ID-preparation failure preserves the draft and current saved conversation before any request is sent.
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
- **8b3.** The submitted user message remains saved with a failed turn status.
- **8b4.** Retry uses the same turn ID and content. Editing a failed message creates a new turn and retains the failed record.

**8c. Message or image storage fails — Exception**
- **8c1.** The system reports the save failure and preserves the draft or unconfirmed submitted text for retry.
- **8c2.** It does not claim unsaved bytes are stored. A failed image upload can require reattaching the original file after a reload.
- **8c3.** Storage limits refuse further image operations while text chat remains available.

**10a. Response delivery is lost — Exception**
- **10a1.** The system checks the saved turn by its stable ID before offering Retry. A replay returns the accepted result without another model request.
- **10a2.** Interrupted pending attempts become retryable after two minutes. An older attempt cannot overwrite a newer attempt's reply.

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

**Display strategy:** Show an empty message area and input beside the student's history. New chat stays available during generation. The active conversation and account scope determine which messages are displayed.

**Systemic failure handling:** Do not report a saved conversation if creation fails. Preserve previous conversation where possible. Rollback depends on whether records are created immediately or on the first message.

### Related Use Cases
- `UC-CHAT-work-through-problem` — Work Through a Chemistry Problem
- `UC-CHAT-check-own-answer` — Check Own Chemistry Answer
- `UC-CHAT-share-problem-image` — Share Chemistry Problem Image

### Assumptions
- Students can initiate separate conversations.
- New conversations exclude previous messages from active context.
- Starting a new conversation does not automatically delete the previous one.
- Saved conversations require verified student authentication; the existing stateless prototype remains a separate compatibility path.
- Empty conversations may exist only in frontend state until the first message.

### Open Issues
- **OI-CHAT-16 resolved:** save on first submitted message.
- **OI-CHAT-17 resolved:** offer the student's own saved chat history.
- **OI-CHAT-18 resolved:** require verified authentication for persistence.
- **OI-CHAT-19 resolved:** discard unsent drafts without confirmation.
- **OI-CHAT-20 resolved:** Gemma generates titles, with a safe fallback.
- **OI-CHAT-21 resolved:** let in-flight replies finish in their original chat.

---

## UC-CHAT-resume-conversation — Resume Saved Conversation

**Primary Actor:** Authenticated student. **Secondary Actors:** Supabase Auth, D1, private R2 storage, Gemma.

**Trigger:** The student opens Coach and selects a saved conversation.

**Preconditions:** The student is authenticated and admitted to the app. The selected conversation belongs to that student and has not expired.

**Postconditions:** Saved messages are shown in chronological order, private images can be reopened, and follow-up coaching uses bounded server-loaded context from this conversation only. Chat content is not exposed to other students or the instructor.

### Main Success Scenario
1. The student opens Coach. The system lists the student's latest saved chats, with titles and last-message dates.
2. The student selects a chat. Any unsent draft in the previous chat is discarded without confirmation.
3. The system verifies ownership and expiration, then loads the latest message page in chronological order. Older pages remain available.
4. The system retrieves private attachments through authenticated requests and displays them alongside the saved text. Assistant Markdown and math formatting are preserved.
5. The student submits a follow-up. The system saves the user turn, obtains a reply using completed earlier pairs and the current message, and saves the accepted reply.
6. The system displays the reply and updates history activity. Saving a message renews the fourteen-day retention period; merely opening a chat or changing its title does not.

### Extensions
- **1a. No saved chats:** show the empty-history state and New chat.
- **1b/3a. Loading fails:** show a usable error and a retry control; a failed request cannot replace another selected conversation's contents.
- **2a. Generation is running:** allow switching; completion updates only its original chat.
- **3b. Missing, expired, or another student's ID:** return the same unavailable/404 response and no private fields.
- **3c. More history exists:** load bounded cursor pages, preserving order and avoiding duplicates.
- **4a. Attachment unavailable or usage-limited:** keep text usable; show image failure and an image retry control. Never put credentials into an image URL.
- **5a. Saved pending/failed turn:** show pending or failed status. Recover pending work by its known ID. Explicit Retry uses the same input/turn ID; edited input starts a separate turn.
- **5b. A response is lost or two tabs send:** recover committed results without duplicate inference; reject a competing pending turn. Conditional finalization rejects stale attempts.
- **Any step, session ends or account changes:** clear private messages, drafts, pending UI updates, and image object URLs; ignore late responses from the previous account.

**Rules and qualities:** `SEC-authentication`, `SEC-student-isolation`, `ROB-external-service`; existing coaching policy continues to govern model replies.

**Limits:** twenty conversations per list page, fifty messages per message page; existing text/image inference bounds are independent of retained display history. Retention is fourteen days from the last saved message, with immediate access refusal at expiration and bounded hourly physical cleanup.

**Open integration:** real Supabase session verification and the app-entry/baseline gate are owned by the login team. End-to-end two-real-account verification is required before this use case is marked Verified.
