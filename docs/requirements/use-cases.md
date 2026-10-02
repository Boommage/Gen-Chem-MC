# Use Cases

**Project:** Gen Chem Metacognition
**Team:** Team #4
**Client:** Heidi Conrad - TCU Chemistry
**Version:** 0.1

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
| _[2026-09-11]_ | 0.1 | Initial use cases derived from the vision and scope feature list | _[Victor Perez]_ |

---

## 1. Introduction

### 1.1 Purpose

_[One paragraph: this document specifies the goals users can accomplish with the system, in enough detail that a developer knows what to build and a tester knows what to check.]_

### 1.2 Scope

_[Which feature areas from the vision and scope are covered here. Name the `FEAT-*` entries. If a feature has no use cases yet, say so rather than leaving the reader to notice.]_

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
| `BNCH` | `FEAT-benchmark-quiz`: Initial study-habits survey | `UC-BNCH-complete-baseline-assessment` |

---

## 4. Use Cases

### UC-BNCH-complete-baseline-assessment: The student completes a baseline assessment

**UC ID and Name:** `UC-BNCH-complete-baseline-assessment`: Complete a baseline assessment
**Created By:** Team 4
**Date Created:** 2026-09-18
**Primary Actor:** student
**Secondary Actors:** none
**Trigger:** The student selects the option to begin the baseline assessment during or after onboarding.
**Description:** The student completes an initial assessment so that the system records the student's current study habits and preferences.

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

