# Software Requirements Specification

**Project:** Gen Chem Metacognition
**Team:** Team #4
**Client:** Heidi Conrad, Chemistry Department, Texas Christian University
**Version:** 0.1

---

_**How to use this template.** Instructions appear in italic square brackets. Fill in underneath them and leave them in place until the document is stable._

_**What this document is, and what it is not.** The specification describes the external behavior of your system completely enough that a developer can build it and a tester can check it. What it is **not** is a container for everything you have written. Your glossary, vision and scope, use cases, and business rules are separate documents with their own identifiers, and this one **links to them rather than repeating them**._

_That makes the specification mostly a hub. Read that as a feature. One fact, one home: a business rule copied in here is a business rule that will disagree with `business-rules.md` by October, and nobody will notice which copy is right. The sections below that say "link to" are supposed to be short._

_What this document owns outright: the requirements that have no other home. Functional requirements that are not part of any use case, quality attributes, external interfaces, data requirements, operating environment, and constraints._

## Identifiers

_Every requirement in this document carries a name-based slug. Create only the spaces your project actually needs._

| Space | For | Example |
|---|---|---|
| `FR-<AREA>-<slug>` | Functional requirements outside any use case | `FR-SAVE-autosave-active` |
| `UI-<slug>` | User interface requirements | `UI-spa-views` |
| `SI-<slug>` | Software and system interfaces | `SI-llm-proxy-only` |
| `CI-<slug>` | Communications interfaces | `CI-email-notifications` |
| `DI-<slug>` | Data requirements | `DI-persist-graph` |
| `OE-<slug>` | Operating environment | `OE-supported-browsers` |
| `CO-<slug>` | Design and implementation constraints | `CO-single-application` |
| `AS-<slug>` / `DE-<slug>` | Assumptions and dependencies | `AS-supported-browser`, `DE-llm-service` |

_Quality attributes get one space per attribute, so the identifier says which kind of quality it is at the place it is cited: `USE-` usability, `PER-` performance, `SEC-` security, `SAF-` safety, `AVL-` availability, `ROB-` robustness, `SCA-` scalability, `INT-` interoperability, `MNT-` maintainability._

_Requirements cited from elsewhere keep their own identifiers: `UC-*` from [use-cases.md](use-cases.md), `BR-*` from [business-rules.md](business-rules.md), `BO-*`, `SM-*`, `FEAT-*` from [vision-and-scope.md](vision-and-scope.md)._

## Revision History

| Date | Version | Description | Author |
|---|---|---|---|
| _[YYYY-MM-DD]_ | 0.1 | Initial draft | _[Name]_ |

---

## 1. Introduction

### 1.1 The purpose of _[project name]_

_[What the system is for: who wants it, why, and who will use it. Even though the vision and scope answers this, restate it in a paragraph here, because people read this document without having read that one.]_

### 1.2 The purpose of this document

_[What this specification covers and for which release.]_

_Example: "This document describes the functional and nonfunctional requirements for release 1.0 of the Cafeteria Ordering System. It serves as the reference for the project's requirements, defining the scope, functionality, and constraints for stakeholders, developers, and testers."]_

### 1.3 Document conventions

_[Any typographical conventions, and the identifier formats above, so that someone adding a requirement later knows how to name it.]_

### 1.4 References

_[Every document this specification refers to, with a link. At minimum, the four other documents in this folder. Include external standards you must conform to.]_

- _[Project glossary](project-glossary.md)_
- _[Vision and scope](vision-and-scope.md)_
- _[Use cases](use-cases.md)_
- _[Business rules](business-rules.md)_
- _[Open issues](OPEN-ISSUES.md)_
- _[The Easy Approach to Requirements Syntax (EARS)](https://alistairmavin.com/ears/)_

---

## 2. Overall Description

### 2.1 Product perspective

_[How this system relates to other systems and to the user's environment. Self-contained, or one component of something larger? Link to the product perspective section of your vision and scope and to your architecture's context diagram rather than redrawing them.]_

### 2.2 User classes and characteristics

_[The kinds of user, and what distinguishes them: frequency of use, technical skill, privilege level, whether they are inside or outside the client's organization. Link to the stakeholder profiles in your vision and scope; what belongs here is what affects the software's behavior, especially permissions.]_

### 2.3 Operating environment

_[The environment the software runs in: hardware, operating systems and versions, browsers, where users and servers are located, and any other software it has to coexist with.]_

_Examples:_

- _`OE-supported-browsers`: The system shall operate correctly on the current and previous major versions of Chrome, Firefox, Safari, and Edge._
- _`OE-server-platform`: The system shall run on a server running the current corporate-approved version of Linux._
- _`OE-access-paths`: The system shall permit access from the corporate intranet, from a VPN connection, and from Android and iOS phones and tablets._

### 2.4 Design and implementation constraints

_[Anything that limits the developers' options: corporate or regulatory policy, hardware limits, required languages or databases, coding standards, interfaces to other applications.]_

_Examples:_

- _`CO-database-engine`: The system shall use the corporate standard database engine._
- _`CO-language-version`: The backend shall be written in Java 21._
- _`CO-coding-standard`: Design, code, and maintenance documentation shall conform to the client's development standard._

_The constraint students forget: **who maintains this after you graduate, and what do they already know how to run?** If the answer is one person who knows Python, a Spring Boot service is a constraint violation nobody wrote down._

### 2.5 Assumptions and dependencies

_[An assumption is a factor you believe true without proof, which would change these requirements if it turned out false. A dependency is something outside your control that the project relies on: an external API, a third-party library, a change someone else has to make.]_

_Examples:_

- _`AS-supported-browser`: Users access the system with a browser that supports the ECMAScript version the frontend targets._
- _`DE-payroll-integration`: Operation depends on changes being made in the Payroll System to accept payment requests for meals ordered through this system._

---

## 3. Project Glossary

_[Link only. The glossary is [project-glossary.md](project-glossary.md).]_

## 4. Vision and Scope

_[Link only. Business requirements, objectives, metrics, and scope live in [vision-and-scope.md](vision-and-scope.md).]_

---

## 5. Functional Requirements

### 5.1 Use cases

_[Link to [use-cases.md](use-cases.md). Most of your system's behavior is specified there, as use cases, and it does not get restated here.]_

### 5.2 Non-use-case functional requirements

_[Behavior that is real, testable, and belongs to no single use case: autosave, validation applied everywhere, notification, authorization, audit logging. If you find yourself writing the same step into six use cases, it belongs here instead._

_Group them under sub-headings by concern, and write each one using an [EARS](https://alistairmavin.com/ears/) shape so that it cannot be read two ways:_

- _**Ubiquitous:** The `<system>` shall `<response>`._
- _**Event driven:** When `<trigger>`, the `<system>` shall `<response>`._
- _**State driven:** While `<in a state>`, the `<system>` shall `<response>`._
- _**Optional:** Where `<feature is included>`, the `<system>` shall `<response>`._
- _**Unwanted behavior:** If `<precondition>`, then the `<system>` shall `<response>`._

_Example: `FR-SAVE-autosave-active`: While a student is editing a weekly activity report during an active week, the system shall persist the draft every 30 seconds._

_**Every requirement here needs an oracle.** If you cannot say how a tester would tell whether it holds, it is not a requirement yet.]_

---

## 6. Business Rules

_[Link only, to [business-rules.md](business-rules.md). Business rules are a rich source of requirements because they dictate properties the system must have in order to conform to them, but the rules themselves are properties of the client's business, not of your software, and they have their own document.]_

---

## 7. Data Requirements

### 7.1 Business domain model

_[The entities in the problem domain and how they relate, as a mermaid class diagram. Model the **business**, not your database schema: this is what the client would recognize, before any decision about tables or persistence.]_

    ```mermaid
    classDiagram
      class Team {
        +String name
      }
      class Student {
        +String email
      }
      Team "1" --> "*" Student : has
    ```

### 7.2 Data dictionary

_[Each entity's fields, with data type, allowed values, defaults, and validation rules. Where a use case already specifies a field's validation in its Associated Information, cite the use case instead of repeating it.]_

### 7.3 Reports

_[Any report the system generates: who reads it, what it contains, how often, and in what format. Reports are where clients discover late that a field they need was never captured, so specify them early.]_

### 7.4 Data acquisition, integrity, retention, and disposal

_[Where the data comes from, how it is kept correct, how long it is kept, and how it is destroyed. If your system holds anything about students or other identifiable people, this section is not optional, and its content is usually a business rule you should cite rather than invent.]_

---

## 8. External Interface Requirements

### 8.1 User interfaces

_[The user-facing surfaces, at requirement level: which views exist, standards they must conform to, accessibility requirements. Link to wireframes or prototypes rather than describing pixel layouts.]_

### 8.2 Hardware interfaces

_[Any hardware the system talks to, or "none".]_

### 8.3 Software interfaces

_[Other software systems yours connects to: what crosses the boundary, in which direction, in what format, and what happens when the other side is unavailable.]_

### 8.4 API document

_[Link to your API documentation. It is generated from the code, so link it rather than transcribing endpoints that will be stale within a week.]_

### 8.5 Communications interfaces

_[Email, notifications, messaging, and the protocols involved.]_

---

## 9. Quality Attributes

_[How well the system does what it does. **This is the section that decides whether your client is happy with software that meets every functional requirement**, so do not treat it as a formality.]_

_The rule for every entry: an adjective is not a requirement. "Fast", "easy", "secure", and "user-friendly" are the starting point of a conversation, not the end of one. Each entry needs a number and a way to measure it._

_Write one subsection per attribute your project actually has, and say "not applicable" with a reason for the ones it does not. An explicit "not applicable" is information; silence is not._

### 9.1 Usability

**USE-core-navigation**: A student shall be able to access their study plan, Pomodoro timer, study history, and AI study assistant within 3 clicks from the main dashboard.

**USE-study-plan**: A first-time student shall be able to create or view their initial study plan within 5 minutes of completing onboarding.

**USE-task-completion**: At least 80% of students participating in usability testing shall be able to start a study session, view their study plan, and access the AI study assistant without help from the development team.

**USE-accessibility**: All primary student-facing pages shall meet WCAG 2.1 Level AA accessibility requirements.


### 9.2 Performance

**PER-page-load**: The dashboard, study plan, and study tracking pages shall load within 2 seconds for at least 95% of requests under normal expected usage.

**PER-ai-response**: The system shall display an AI response or a loading indicator within 3 seconds after a student submits a question.

**PER-study-log**: A completed study session shall appear in the student's study history within 2 seconds after being saved.


### 9.3 Security

**SEC-authentication**: 100% of student-specific pages and API endpoints shall require an authenticated user before returning private student information.

**SEC-student-isolation**: Students shall only be able to access their own grades, study plans, study history, confidence ratings, and other private academic information.

**SEC-grade-consent**: The platform shall not import or use a student's D2L grade information unless the student has explicitly chosen to share it.

**SEC-passwords**: If passwords are stored by the platform, 100% of passwords shall be stored using a recognized password-hashing algorithm and shall never be stored as plain text.


### 9.4 Safety

**SAF-ai-guidance**: For General Chemistry practice questions, the AI study assistant shall provide at least one guiding question, hint, or explanation before providing a final answer.

**SAF-ai-transparency**: The AI study assistant shall clearly identify itself as an AI study tool and shall not claim that its generated chemistry explanations are guaranteed to be correct.


### 9.5 Availability

**AVL-uptime**: The platform shall maintain at least 99% availability during the academic term, excluding announced maintenance periods and outages caused by external services such as D2L or the AI provider.


### 9.6 Robustness

**ROB-study-session**: If a student refreshes the page or temporarily loses connection during an active Pomodoro session, the system shall restore the session with no more than 10 seconds of timer difference.

**ROB-external-service**: If D2L, the AI service, or another external integration is unavailable, the platform shall display an understandable error message and keep unrelated platform features usable.

**ROB-invalid-data**: Invalid or incomplete schedule, study-session, and check-in information shall be rejected with an error message instead of causing the application to crash or save corrupted information.


### 9.7 Scalability, Interoperability, Maintainability

**SCA-concurrent-users**: The platform shall support at least 100 simultaneously active students without increasing the 95th-percentile page-load time beyond 3 seconds.

**INT-d2l**: The platform shall use an approved D2L integration method or API when accessing academic information and shall only access information that the student has authorized.

**INT-calendar**: Study-plan events shall use a standardized date and time format so that future integration with external calendar services can be added without redesigning the study-plan data model.

**MNT-documentation**: All major application modules and external integrations shall include documentation explaining their purpose, dependencies, and setup requirements.

**MNT-setup**: A new developer following the project's README shall be able to install the required dependencies, configure the development environment, and launch the application within 30 minutes, excluding time required to obtain external API credentials.

---

## 10. Internationalization and Localization

_[Languages, character sets, time zones, date and currency formats. If the answer is a single locale, say so and say why, because that is a real constraint on who can use the system.]_

---

## 11. Other Requirements

_[Anything real that fits nowhere above: legal, licensing, installation, training, documentation. Delete this section if it is empty rather than leaving it as a placeholder.]_

---

## Working this document with your agent

_[Delegate: converting prose requirements into EARS shapes; checking that every `UC-*`, `BR-*`, and `FEAT-*` cited here exists in the document that owns it; finding functional requirements that appear in several use cases and should be lifted into section 5.2; drafting an oracle for a quality attribute you have stated only as an adjective._

_Keep human: the numbers. Every threshold in section 9 is a commitment somebody has to live with, and an agent will supply a plausible one (99.9% uptime, 200ms response) that nobody asked for and no one can meet. A number in this document either came from your client, from a measurement, or from a decision your team made deliberately and can defend._

_**The specific failure to watch for: invented precision.** A generated specification reads as authoritative at exactly the points where it is guessing. Check every number, every browser version, every retention period against something real, and put the ones you cannot verify in [OPEN-ISSUES.md](OPEN-ISSUES.md) instead of leaving a confident guess in the document your team will build from.]_
