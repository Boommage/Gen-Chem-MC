# Use Cases

**Project:** Gen Chem Metacognition (Neocortex)\
**Team:** Team #4\
**Version:** 0.2 — Checkpoint 2 review draft\
**Prototype reference:** `main` at `fe52c63` (Gemma integration, PR #22).

## 1. Purpose and scope

This document records what can be demonstrated on November 9, 2026 and the small set of next use cases the team wants to trace. The working prototype has a Coach conversation with text and optional images. Dashboard, Study, and Progress are navigation shells. Student sign-in, saved conversations, baseline assessment, timed sessions, confidence records, and progress data are future work.

Use case IDs are stable. Follow-ups and error paths stay within the use case whose goal they support. See the [traceability matrix](../traceability.md) for evidence and [open issues](OPEN-ISSUES.md) for decisions still needed.

## 2. Use case list

| ID | Student goal | Checkpoint status |
|---|---|---|
| `UC-CHAT-work-through-problem` | Get a guiding Coach reply using text or an image, and continue the current conversation. | Built for prototype; model behavior evidence is partial. |
| `UC-CHAT-resume-conversation` | Reopen a conversation from an earlier visit. | Future. |
| `UC-BNCH-complete-baseline-assessment` | Complete the required study-habits assessment and initialize default study preferences. | Future; prior design covers submission only. |
| `UC-TIMR-run-study-session` | Run a timed study session and record confidence before and after. | Future. |
| `UC-SLOG-review-study-summary` | View a personal study summary and confidence trends. | Future. |
| `UC-ACCT-sign-in` | Gain, recover, or end access to a student account. | Future; grouped for checkpoint review. |

Course grounding, manual logging for study outside the app, and a structured reflection flow remain in the published scope. They have no independent use-case rows in this short list; the [traceability gap list](../traceability.md#scope-gaps-for-review) keeps them visible.

## 3. Checkpoint prototype

### UC-CHAT-work-through-problem: Get guidance from Coach

**UC ID and Name:** `UC-CHAT-work-through-problem`: Get guidance from Coach\
**Created By / Date Created:** Team 4 checkpoint draft / 2026-11-06\
**Primary Actor:** Student (team tester in the prototype)\
**Secondary Actors:** Hosted Gemma service\
**Trigger:** The actor opens Coach and wants help with a chemistry problem or study approach.\
**Description:** The actor receives a guiding response and can continue the same open conversation.

**Preconditions**

- PRE-1. The actor can open the Coach page.
- PRE-2. A compatible Coach backend is configured; the hosted prototype accepts the team's development token. There is no individual student sign-in.

**Postconditions**

- POST-1. The submitted turn and accepted Coach reply are shown in the current view.
- POST-2. Recent turns are available for follow-ups in that view. Leaving Coach or refreshing clears the conversation; no transcript or image is saved by the app.

**Main success scenario**

1. The actor opens Coach and sees an empty conversation with starter prompts.
2. The actor enters a question or chooses a starter prompt, then sends it.
3. The app shows the submitted message and a Thinking indicator while the Worker requests a reply from Gemma.
4. The app displays the final reply, formatting supported Markdown and math.
5. The actor may send a follow-up. The app sends a bounded set of recent turns from the same conversation and returns to step 3.

**Extensions**

- **2a. Image input:** The actor attaches one valid JPEG/PNG, reviews or removes its preview, and sends it with a question or the default image prompt. The app checks image support before inference, displays the attachment in the conversation, and continues at step 3.
- **2b. Empty input or invalid attachment:** The app blocks an empty send without an image, or explains why a file cannot be attached. The actor can correct the input.
- **3a. Request fails or the reply is unusable:** The app explains the failure and offers Retry or Edit message. Retry resends the same turn without duplicating it; Edit restores the draft and its attachment. No successful reply is shown for a failed turn.
- **3b. Actor leaves Coach:** The app aborts its pending browser request and discards the current conversation. A return visit starts a new conversation. An already-running upstream inference may continue.
- **4a. Actor asks for the answer or submits an attempt:** The required behavior is to withhold solutions and lead with guidance; Coach may confirm an answer the student produced and justified. If the reasoning is wrong or absent, prompt the student to reconsider or explain it. These are model instructions; this checkpoint does not establish reliable compliance.
- **4b. Unrelated question:** A polite redirect to chemistry reasoning or study habits is the proposed behavior. The prototype has a coaching prompt but no dedicated topic check or verified redirect policy. See OI-6.

**Priority / Frequency:** High / repeatedly during study.\
**Business Rules:** `BR-no-direct-answers`, `BR-answer-confirmation-only`, `BR-student-initiated-breakdown`, `BR-no-content-teaching`.\
**Associated Information:** One JPEG/PNG up to 2 MiB, 4096 pixels per side, and 12 megapixels. Recent context is bounded to at most 21 messages, 12,000 text characters, and two images. Usage events contain counts and timing; the app does not store conversation content. The server checks reply shape and completion, not whether the reply semantically leaks an answer.\
**Related Use Cases:** `UC-CHAT-resume-conversation` (future).\
**Assumptions:** The checkpoint uses fabricated messages and images. The same Gemma model handles text and image requests through one Worker endpoint.\
**Open Issues:** OI-5, OI-6.

## 4. Future use cases

These are specifications for discussion and later implementation. They are not part of the checkpoint demonstration.

### UC-CHAT-resume-conversation: Reopen a saved conversation

**UC ID and Name:** `UC-CHAT-resume-conversation`: Reopen a saved conversation\
**Created By / Date Created:** Team 4 checkpoint draft / 2026-11-06\
**Primary Actor:** Student\
**Secondary Actors:** None\
**Trigger:** The student selects a past conversation in Coach.\
**Description:** The student returns to their own saved transcript and continues from it.

**Preconditions**

- PRE-1. The student has a valid session and completed baseline assessment.
- PRE-2. The selected conversation was saved and is still within the approved retention period.

**Postconditions**

- POST-1. Only the student's own permitted history is displayed.
- POST-2. A new turn continues the selected conversation with bounded model context.

**Main success scenario**

1. The student opens saved conversations.
2. The system lists only the student's saved conversations.
3. The student selects one. The system checks ownership and loads the available transcript.
4. The student can continue with `UC-CHAT-work-through-problem`; a successful new turn is associated with the same conversation.

**Extensions**

- **2a. No saved conversations:** The system offers to start a new one.
- **2b. Student chooses New chat:** The system opens an empty conversation without replacing the existing ones. The first successful exchange creates a new saved conversation.
- **3a. Missing, expired, or unauthorized conversation:** The system refuses access without revealing another student's conversation.
- **3b. History is unavailable:** The system explains the failure and offers a retry without overwriting the stored conversation.
- **4a. Earlier image unavailable:** The student is told to reattach it if image bytes were not retained. Exact retention is open.

**Priority / Frequency:** High after authentication / on return visits.\
**Business Rules:** The linked Coach use case still governs new replies.\
**Associated Information:** Identity comes from the verified session. A conversation identifier alone never grants access. Text history, image retention, and model context are separate concerns.\
**Related Use Cases:** `UC-ACCT-sign-in`, `UC-CHAT-work-through-problem`.\
**Assumptions:** A private persistence design is approved before rollout.\
**Open Issues:** OI-1, OI-3.

### UC-BNCH-complete-baseline-assessment: Complete a baseline assessment

**UC ID and Name:** `UC-BNCH-complete-baseline-assessment`: Complete a baseline assessment\
**Created By / Date Created:** Team 4 / 2026-09-18\
**Primary Actor:** Student\
**Secondary Actors:** None\
**Trigger:** A student signs in successfully without a completed assessment.\
**Description:** The student records current study habits and preferences so the app can initialize default study preferences. This is not a chemistry knowledge quiz.

**Preconditions**

- PRE-1. The student has an authenticated session.
- PRE-2. The baseline assessment is available and not yet marked complete for this student.

**Postconditions**

- POST-1. The student's validated answers and completion state are saved.
- POST-2. Default study preferences are available from the student's inputs, and the student can continue to the app. The mapping of answers to defaults is open.

**Main success scenario**

1. The system directs the student to the required assessment.
2. The system retrieves the questions and explains the purpose of the assessment.
3. The student begins the assessment.
4. The system presents a question about current study habits or preferences.
5. The student answers the question.
6. The system records the response in the in-progress assessment and presents the next question.
7. The student repeats steps 5 and 6 until all questions are answered.
8. The system displays the assessment for review and submission.
9. The student submits the assessment.
10. The system validates the required responses.
11. The system saves the validated answers for the student, initializes default study preferences, and confirms completion only after the required changes succeed.
12. The system lets the student continue to the student app.

**Extensions**

- **3a. Saved draft exists.** The system offers to resume the student's own draft. The student opens it and continues from step 4 with their previously saved responses.
- **6a. Save and leave.** The student saves a draft and leaves. The system confirms only after the draft is saved. The app gate stays in effect on return.
- **6b. Draft save fails.** The system reports the failure and keeps entered responses available for a retry where feasible. The completion state remains unchanged.
- **10a. A required response is missing.** The system identifies the unanswered questions and preserves the other answers. The student fills in the gaps and the flow rejoins at step 10.
- **11a. The system cannot complete submission.** The system explains the failure, keeps the student at the assessment, and preserves responses for retry where feasible. A failed submission cannot mark the student complete or leave partially initialized defaults.

**Priority / Frequency:** High / required once before first use; retakes are open.\
**Business Rules:** None assigned.\
**Associated Information:** The assessment collects required selections or text about study behavior. Drafts, answers, completion state, and defaults belong to the student. Completion is set only after validated responses and defaults are saved. The [merged baseline design](../design/design-of-record.md) covers the original submission flow only. First-sign-in gating, durable drafts, and initialization of defaults must be reviewed in that design before implementation.\
**Related Use Cases:** `UC-ACCT-sign-in`, `UC-TIMR-run-study-session`.\
**Assumptions:** The approved question set is available.\
**Open Issues:** OI-2, OI-3.

### UC-TIMR-run-study-session: Run a timed study session

**UC ID and Name:** `UC-TIMR-run-study-session`: Run a timed study session\
**Created By / Date Created:** Team 4 checkpoint draft / 2026-11-06\
**Primary Actor:** Student\
**Secondary Actors:** None\
**Trigger:** The student chooses to start a study session.\
**Description:** The student runs a study timer and records confidence before and after studying.

**Preconditions**

- PRE-1. The student has a valid session and completed baseline assessment.
- PRE-2. The student's study defaults are available, or the student supplies valid session settings.

**Postconditions**

- POST-1. A successfully saved session records its duration and study details.
- POST-2. Before and after confidence ratings are associated with the session where recorded. The student's summary can include the saved session.

**Main success scenario**

1. The student opens Study; the system presents default study preferences derived from their baseline.
2. The system asks for a before-session confidence rating.
3. The student starts the timer; the system displays the elapsed or remaining time.
4. The session reaches its end or the student ends it.
5. The system asks for an after-session confidence rating.
6. The student submits the session. The system saves it, confirms the result, and makes it visible in Progress within 2 seconds (`PER-study-log`).

**Extensions**

- **3a. Refresh or temporary loss of connection:** The system restores the active timer with at most a 10-second difference (`ROB-study-session`).
- **4a. Student stops early:** The system offers to save the actual elapsed session or discard it.
- **6a. Save fails:** The system reports the error and retains the pending session where feasible for retry without a duplicate record.

**Priority / Frequency:** High / whenever the student studies with the timer.\
**Business Rules:** None assigned.\
**Associated Information:** Prompt timing is before and after. Rating scale, whether either answer is required, and exact session defaults are open. This flow records app-timed sessions only.\
**Related Use Cases:** `UC-BNCH-complete-baseline-assessment`, `UC-SLOG-review-study-summary`.\
**Assumptions:** Saved sessions are associated with the signed-in student.\
**Open Issues:** OI-2, OI-4.

### UC-SLOG-review-study-summary: View personal study progress

**UC ID and Name:** `UC-SLOG-review-study-summary`: View personal study progress\
**Created By / Date Created:** Team 4 checkpoint draft / 2026-11-06\
**Primary Actor:** Student\
**Secondary Actors:** None\
**Trigger:** The student opens Progress.\
**Description:** The student views their own recorded study activity and available confidence information.

**Preconditions**

- PRE-1. The student has a valid session and completed baseline assessment.

**Postconditions**

- POST-1. The app shows only the student's own permitted study summary; viewing it changes no study records.

**Main success scenario**

1. The student opens Progress.
2. The system retrieves the student's saved sessions and available confidence ratings.
3. The system presents a summary of study activity and confidence over time.

**Extensions**

- **2a. No records yet:** The system shows an empty state and points to starting a study session.
- **2b. Data unavailable:** The system explains the failure and offers retry.
- **3a. Too little data:** The system shows available records without claiming a trend or causal relationship.

**Priority / Frequency:** Medium / periodically.\
**Business Rules:** None assigned.\
**Associated Information:** This is the student's view. Instructor metrics, research exports, and grades are outside this use case.\
**Related Use Cases:** `UC-TIMR-run-study-session`, `UC-ACCT-sign-in`.\
**Assumptions:** The summary can use timed-session records first; manual logging is an open scope gap.\
**Open Issues:** OI-4, OI-7.

### UC-ACCT-sign-in: Access a student account

**UC ID and Name:** `UC-ACCT-sign-in`: Access a student account\
**Created By / Date Created:** Team 4 checkpoint draft / 2026-11-06\
**Primary Actor:** Student\
**Secondary Actors:** Identity and email services (provider setup to confirm)\
**Trigger:** The student opens the app and needs to authenticate.\
**Description:** The student signs in, with registration, verification, recovery, and ending a session captured as related paths for checkpoint planning.

**Preconditions**

- PRE-1. The account entry page and configured identity service are available.

**Postconditions**

- POST-1. A successful sign-in creates a verified session. A student without a completed baseline is routed to that required assessment.
- POST-2. A failed, expired, or ended session grants no access to protected student data.

**Main success scenario**

1. The student enters their account credentials.
2. The system validates the credentials and verifies the account state.
3. The system establishes a session and checks baseline completion.
4. The system routes the student to the required baseline assessment or, if complete, to the student app.

**Extensions**

- **1a. New student:** The student signs up and verifies the account through the configured email flow before signing in.
- **1b. Forgotten password:** The student requests a reset and sets a new password after verification; expired or invalid reset links do not change the account.
- **2a. Wrong password or unverified account:** The system refuses access and offers the appropriate recovery or verification path without exposing private account information.
- **2b. Identity service unavailable:** The system gives a retryable error and does not establish a session.
- **4a. Student logs out or the session expires:** Protected access ends, and the student is directed to sign in again.

**Priority / Frequency:** High / at entry, recovery, and session expiry.\
**Business Rules:** None assigned.\
**Associated Information:** Student ownership is derived from authenticated identity. The existing team token cannot stand in for a student account. Research consent is separate from account access and remains open.\
**Related Use Cases:** `UC-BNCH-complete-baseline-assessment`, `UC-CHAT-resume-conversation`.\
**Assumptions:** The team approves a student identity, verification, and reset flow before implementation.\
**Open Issues:** OI-3. Split account operations into separate implementation work items if needed when the team designs them.
