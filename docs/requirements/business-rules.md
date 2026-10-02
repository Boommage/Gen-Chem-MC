# Business Rules

**Project:** Gen Chem Metacognition
**Team:** Team #4
**Client:** Heidi Conrad, Chemistry Department, Texas Christian University
**Version:** 0.1

---

_**How to use this template.** Instructions appear in italic square brackets. Fill in underneath them and leave them in place until the document is stable._

_**What a business rule is.** A corporate policy, a government regulation, a law, an industry standard, or a computational formula. Business rules are a rich source of requirements, because they dictate properties your system must have in order to conform to them._

_**What a business rule is not: a software requirement.** This is the distinction students get wrong, so read it twice. A rule is a property of the **business**. It exists whether or not your software does, it was true before you arrived, and it will still be true if the project is cancelled. "A student may only submit a peer evaluation during an active week" is a rule the course had before anyone wrote code._

_What belongs to your software is the **enforcement** of that rule, and that is a functional requirement, written in the specification and cited back here. Keeping the two apart is what lets you answer the question that comes up every semester: "who decided this, and can we change it?" If it is a rule, the client's organization decides and you comply. If it is a requirement, your team decides and you can negotiate._

## How to hear one in a meeting

_[Rules almost never arrive announced. They surface in the middle of a story about something else, usually in one of these shapes:]_

- _"Must comply with..."_
- _"Only `<someone>` may `<do something>`"_
- _"If `<condition>`, then `<something happens>`"_
- _"Must be calculated according to..."_
- _"...unless it has been more than a year."_

_Examples of a client stating a rule without knowing it: "A new client must pay 30 percent of the estimated consulting fee and travel expenses in advance." "Time-off approvals must comply with the company's vacation policy."_

_When you hear one, write it down in the meeting. You will not reconstruct it afterward, and the exact wording matters because the rule is someone else's sentence, not yours._

## The five shapes a rule takes

_[Useful for recognizing rules, not for organizing this document. Sections below are grouped by topic, not by these categories.]_

| Shape | What it does | Example |
|---|---|---|
| **Fact** | States something always true about the business | Every senior design team belongs to exactly one course section. |
| **Constraint** | Restricts what may be done, or by whom | Only a course admin may create a course section. |
| **Action enabler** | Triggers an action when a condition holds | If a student has not completed safety training in 12 months, the request is refused. |
| **Inference** | Derives a new fact from known facts | A team with no submissions for two consecutive weeks is at risk. |
| **Computation** | Defines how a value is calculated | The peer evaluation score is the mean of all scores received that week. |

_Computations are the ones teams forget are rules. A formula the client uses today is a rule you must reproduce exactly, not a design decision you get to make. Ask for the spreadsheet._

## What a rule turns into

_[One rule usually propagates into several requirements of different kinds. This is why the document exists as its own artifact rather than being scattered through the specification.]_

| Requirement type | How the rule shows up | Example |
|---|---|---|
| Business requirement | A regulation drives a business objective | The system must enable compliance with all federal and state chemical reporting regulations within five months. |
| User requirement | A privacy policy dictates who may do what | Only laboratory managers may generate chemical exposure reports for anyone other than themselves. |
| Functional requirement | A company policy becomes system behavior | If an invoice is received from an unregistered vendor, the system shall email the vendor the supplier intake form and the W-9. |
| Quality attribute | A safety regulation becomes a checked property | The system must maintain safety training records and check them before a user can request a hazardous chemical. |

## Identifiers and traceability

_Each rule carries a stable `BR-<slug>` identifier, a name-based slug coined from the rule's gist: `BR-active-weeks`, `BR-section-admin-only`, `BR-artifact-key-unique`. Never renumber, rename, or repoint one. The thematic grouping into sections below is organizational only and does not affect a rule's identity, so moving a rule between sections is free and renaming it is not._

_**Cite rules, do not copy them.** When a use case is governed by a rule, its Business Rules field carries the identifier only, never the rule's text. One rule, one home. A rule copied into three use cases will be updated in one of them._

_A rule may cite another rule by identifier where one depends on another._

## Every rule needs a source

_[The column teams leave blank, and the one that matters most. For each rule, record where it comes from: a named policy document, a regulation, a page of the client's handbook, or the person who told you and the date.]_

_A rule you cannot attribute is usually not a rule. It is your team's design decision wearing a rule's clothes, and it belongs in the specification where it can be argued with. The test: if you asked your client to change it tomorrow, who would have to approve? If the answer is "you", it was never a rule._

_Where a rule is expected to change, say so and say when. Rules change on the business's schedule, not on yours._

## Where your AI teammate helps, and where it is dangerous

_[Delegate: turning your meeting notes into candidate rules, spotting sentences in a transcript that have the shape of a rule, and finding use cases in your specification that a given rule ought to govern but does not cite.]_

_**Do not let it invent rules.** This section is the single most dangerous place in your requirements for fabricated content, because an invented rule reads exactly like a real one. "Passwords must be at least 8 characters." "Records must be retained for 7 years." Both are plausible, both are common, and neither is your client's policy unless your client said so. A fabricated rule then propagates into functional requirements, tests that pass, and code that enforces something nobody asked for._

_The Source column is the defense. Every rule traces to a document or a person, or it does not go in the file. When your agent proposes a rule, the only question is: who told us this?_

## Revision History

| Date | Version | Description | Author |
|---|---|---|---|
| _[YYYY-MM-DD]_ | 0.1 | Initial rules from the client brief and first client meeting | _[Name]_ |

---

## 1. Introduction

### 1.1 Purpose

_[One paragraph: this document collects the policies, regulations, standards, and formulas that govern the business your software operates in, so the specification can cite them rather than restate them.]_
This document collects the policies and design philosophy that Heidi Conrad (Instructor, Department of Chemistry) has stated for the Gen Chem Metacognition project, so the specification can cite them instead of restating them. Because this project is early-stage, most of what surfaced in the first meeting is scope, goals, and open questions rather than firm rules — the sections below capture only what currently meets the bar of an attributable, business-owned constraint.

### 1.2 Scope

_[Which parts of the client's business these rules cover, and which are out of scope. If your client's organization has rules that your system does not touch, say so here rather than silently omitting them.]_

This document covers rules about **how the coaching tool is allowed to behave toward a student** — specifically the client's core differentiator (guide, don't answer). It does not yet cover:

- Data-sharing/access arrangements (D2L access, YouTube lecture videos as training material) — these are resource/logistics arrangements, not business rules, and likely belong in a data-access or integration document once formalized.
- Target population (freshmen / transitioning students), study methods to support (Pomodoro, benchmark quiz), and "big scope" items (assignment tracker, cross-class notifications) — these are project scope and requirements decisions, not rules the business held independent of this software, and belong in the specification/vision document instead.
- Anything from "Retention Methods" not explicitly confirmed as client-owned policy (see flagged candidate below).
---

## 2. Rules

_[Group rules under topic headings that fit your project. The Project Pulse headings are one example, not a required set: Course Administration, Teams and Assignment, Access and Ownership, Identity and Uniqueness, Editing and Locking, Deletion Integrity, Review and Submission._

_Format each rule as a bold identifier, the rule in one sentence, then its source. Worked examples:]_

### 2.1 Tutoring and Guidance Behavior

- **`BR-no-direct-answers`:** The system must never give a student the final answer to a chemistry problem or question; it may only guide the student toward finding the answer themselves.
  **Source:** client meeting notes — "Current AI platforms provide the answer - ours should never provide the answer but guide them." Confirmed by Heidi Conrad, client meeting, _[confirm date]_.

- **`BR-answer-confirmation-only`:** The system may confirm whether a student's own answer is correct, but only after the student has produced an answer themselves; it does not supply the answer in advance of that. Depends on `BR-no-direct-answers`.
  **Source:** client meeting notes — "Only tell them the answer if they got the answer correctly." Confirmed by Heidi Conrad, client meeting, _[confirm date]_.

- **`BR-student-initiated-breakdown`:** When a student cannot break a problem down, the system prompts the student to break the problem down themselves; the system does not perform the breakdown for them. Depends on `BR-no-direct-answers`.
  **Source:** client meeting notes — "The app does not break down itself... It asks students to break down the problem." Confirmed by Heidi Conrad, client meeting, _[confirm date]_.

- **`BR-no-content-teaching`:** The system does not teach chemistry content or solve chemistry problems; its scope is limited to helping students reflect on and improve their study habits and preparation.
  **Source:** client project brief, "Gen Chem Metacognition: A General Chemistry Success Coach" — "The goal is not for the AI to teach chemistry or solve chemistry problems. Instead, it should act as a coach..."

- **`BR-no-direct-answers`:** The system must never give a student the final answer to a chemistry problem or question; it may only guide the student toward finding the answer themselves.
  **Source:** Client meeting notes, September 8, 2026 — Heidi Conrad: "Current AI platforms provide the answer - ours should never provide the answer but guide them."

  ### 2.2 Candidate Rules — Not Yet Confirmed

_[Flagged per the checklist: these have the shape of a rule but the source is the team's own brainstorm, not a client statement. Confirm with Heidi before treating as a real rule, or move to the specification as a team design decision.]_

- **`BR-leaderboard-professor-only`** *(unconfirmed)***:** If a leaderboard/points feature is implemented, it is visible only to the course instructor, not to students.
  **Source:** team brainstorm ("Retention Methods" notes), not yet raised with or confirmed by the client. **Action:** ask Heidi directly at the next meeting; if she didn't originate this, it is a team design decision and belongs in the specification, not here.


_[That third entry is deliberate. Flag rules you are not sure about rather than dropping them; deciding whether something is a rule or a requirement is a conversation to have with your client, and it is worth having.]_

_**Checklist:** Does every rule have a source? Could your client change it without asking you? Is it stated as one sentence about the business, rather than as a sentence about your software? Does any use case cite it, and if none does, is that correct?_
