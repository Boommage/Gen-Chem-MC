# Open Issues

**Project:** Gen Chem Metacognition (Neocortex)\
**Team:** Team #4\
**Checkpoint review:** November 6, 2026

This is the checkpoint shortlist of questions with a concrete effect on requirements, design, or verification. Existing longer-term issues in [Vision and Scope](vision-and-scope.md#5-open-issues-raised-by-this-document) remain open unless explicitly resolved.

## Open

| ID | Question | Why it matters | Who can answer | Raised |
|---|---|---|---|---|
| OI-1 | How long may saved chats and attachments be kept? Is reopening text enough, or must earlier image bytes be available? | Blocks the history storage and deletion design. The current prototype saves neither. | Team and client | 2026-11-06 |
| OI-2 | What questions and default-session settings does the baseline use, how do answers map to defaults, and can students retake it? Where should an unfinished draft survive? | The required first-sign-in gate, draft resume, and defaults extend the merged baseline design. | Team and client | 2026-11-06 |
| OI-3 | Which identity provider, email eligibility and verification method will the team use? Which instructor metrics and display rules are approved beyond the confirmed Private behavior? | Blocks student account design, private persistence, and instructor access. Confirm data retention and research consent separately; a pseudonym is not proof of anonymity. | Team and client | 2026-11-06 |
| OI-4 | What scale is used for before/after confidence, may a student skip a rating, and which saved values belong in Progress? | Defines the future timer and progress acceptance criteria. | Team and client | 2026-11-06 |
| OI-5 | What fabricated multi-turn and image-based cases count toward `SM-no-answer-leak`, and what is the review process for failures? | Current tests cover request and reply handling, not semantic tutoring compliance. No feature work is planned for this checkpoint. | Team and client/TA | 2026-11-06 |
| OI-6 | How should Coach respond to unrelated questions: redirect, decline, or distinguish general study advice from unrelated topics? | No dedicated off-topic behavior is specified or verified in the prototype. | Team and client | 2026-11-06 |
| OI-7 | After Checkpoint 2, which published scope gaps should receive use cases or be explicitly deferred: course grounding, manual study logging, and structured reflection? | Keeps the short checkpoint list from being mistaken for a scope change. Instructor reporting and research consent also remain outside the short list. | Team and client | 2026-11-06 |
| OI-8 | Where will the student-facing frontend be hosted and who will operate the Worker, identity service, and database after handoff? | The checkpoint uses local Vite plus a hosted Worker. It is not the former one-project Vercel topology or a completed student deployment. | Team and client | 2026-11-06 |

## Resolved for this checkpoint draft

| Decision | Answer | Source | Filed in |
|---|---|---|---|
| Final answers | Coach must not supply a solution or breakdown. It may confirm a student-produced correct answer supported by their reasoning. | Client interview and Team 4 clarification, 2026-11-06 | [Business rules](business-rules.md#21-tutoring-and-guidance-behavior), [SRS](software-requirements-specification.md#94-safety) |
| Baseline purpose and gate | Survey study habits, initialize default study preferences, and require completion before access after sign-in. | Team 4, 2026-11-06 | [Baseline use case](use-cases.md#uc-bnch-complete-baseline-assessment-complete-a-baseline-assessment), [glossary](project-glossary.md) |
| Confidence timing | Prompt before and after a timed session. | Team 4, 2026-11-06 | [Timed study use case](use-cases.md#uc-timr-run-study-session-run-a-timed-study-session) |
| Private instructor view | Show per-student metrics under a pseudonym and class averages. Keep chat, reflection, and baseline answers private from instructors. | Team 4, 2026-11-06; future requirement, not prototype behavior | [Architecture security](../design/architectural-design.md#81-security) |
| Prototype stack | Keep the TypeScript Worker and hosted Gemma; Node.js is used for development tooling and the local mock. | Team 4, 2026-11-06; verified on merged PR #22 | [Architecture decisions](../design/architectural-design.md#92-key-decisions) |
| Checkpoint scope | Freeze prototype features. Write a small future use-case set and keep uncovered scope visible as gaps. | Team 4, 2026-11-06 | [Traceability](../traceability.md#scope-gaps-for-review) |
