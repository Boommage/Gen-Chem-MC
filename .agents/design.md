---
name: design
description: Draft and, after explicit approval, record the design for one use case. Stops before implementation.
argument-hint: <UC-ID> (for example, UC-BNCH-complete-baseline-assessment)
---

# Design a use case

Use this instruction when asked to design a `UC-*` use case. Treat the supplied
argument as `UC-ID`. Produce a design-of-record at `docs/design/<area>.md`, where
`<area>` is the lowercase area segment in the identifier (for example,
`UC-BNCH-complete-baseline-assessment` uses `docs/design/bnch.md`). This is the
first of two stages: it **must stop before code is changed**. Implementation begins
only with `.agents/implement.md`, after a teammate has merged the design.

The use case is the contract; its cited `BR-*` and `FR-*` identifiers are the
acceptance criteria; and the glossary owns the vocabulary. The design explains how
the code realizes those sources. Cite identifiers and source documents rather than
copying their requirement text.

The requirements and architecture are authoritative but not infallible. Do not
silently invent missing behavior, preserve a stale constraint, or hide a conflict.
State the gap, the recommended resolution and why, and the document that should be
changed. A requirement or rule reference that does not exist is a question, not an
invitation to create a plausible replacement.

If no use-case ID was supplied, ask for one. If useful, list the unstarted rows in
`docs/traceability.md`, ordered by release date. Do not edit anything until the
proposal in phase 2 has received explicit developer approval.

## Phase 1 — understand (read only)

Read and cross-check the following:

1. The identified use case in `docs/requirements/use-cases.md`: actors, trigger,
   preconditions, postconditions, main scenario, every extension, Business Rules,
   and Associated Information.
2. Every cited business rule in `docs/requirements/business-rules.md`, and relevant
   functional and quality requirements in
   `docs/requirements/software-requirements-specification.md`.
3. `docs/requirements/project-glossary.md` and relevant entries in
   `docs/requirements/OPEN-ISSUES.md`.
4. `docs/design/architectural-design.md`, especially the area component, containers,
   significant requirements, and all of section 8, Crosscutting Concepts.
5. The use case's traceability row, the existing area design (if any), and the code
   the area touches. Read the current `main` commit hash for the design's
   *Designed against* field.
6. The local `docs/design/design-of-record.md` template if it exists; otherwise the
   course template at
   `https://github.com/tcu-cosc-40943/course-templates/blob/main/design/design-of-record.md`.
   Its italic instructions are part of the brief, except its instruction to have the
   developer sketch first: make the draft yourself.
7. `AGENTS.md`, if present, for repository-wide constraints.

Confirm every cited identifier exists. Follow the architecture conventions even if
existing prototype code does not, and flag that drift.

## Phase 2 — propose, then wait

Present a complete design proposal in the conversation; do not write files yet.
Include each template section:

- **Realizes / Depends on:** relevant `UC-*`, `FR-*`, `BR-*`, and constraints.
- A Mermaid sequence diagram for the main scenario with every interaction labeled by
  its use-case step. Add a class diagram for new structure, an ER diagram for data
  changes, and a state diagram for a lifecycle when applicable.
- Reused and new components/classes, including existing-file pointers.
- An API-contract row for every endpoint or job: caller/authorization, request,
  successful response, and each extension's error in the section-8.2 error shape.
  Never omit this section.
- Key decisions that name a rejected alternative and reason; data-model changes (or
  “No change” with a reason); and a test row for the main flow and every extension.
- Architecture-of-record changes (or “None”), open questions, and risks.

Then list every assumption the requirements, architecture, and code did not settle.
For each, say whether it belongs in the requirements, `AGENTS.md`, or the design.
Every sequence interaction must implement a named use-case step; otherwise it is a
missing requirement or scope creep and must not enter the design.

Ask for explicit approval of the proposal's shape. Approval permits phase 3 only;
it is not a substitute for independent teammate review of the eventual pull request.

## Phase 3 — write the design (only after approval)

Work on a branch, never directly on `main`. Create or revise
`docs/design/<area>.md` from the template.

- Keep one design document per area. For an existing document, extend its Realizes,
  diagrams, contracts, and tests in place; do not add a duplicate `## UC-...`
  skeleton.
- Cite the use case, business rules, requirements, and architecture rather than
  restating them. Specify choices where a wrong guess would break a requirement;
  leave incidental implementation details for the build.
- Put an approved architecture change in `docs/design/architectural-design.md` and
  list it in the design. Apply an agreed requirement correction in `docs/requirements/`.
  Put client-only questions in `OPEN-ISSUES.md`.

## Phase 4 — record and hand off

Update the traceability row: set **Build** to `📐 Designed`, set **Design** to
`design/<area>.md`, and leave Code, Tests, and Verify for implementation. Run a
fresh-context questions test: have a new Codex session inspect only the use case,
its rules, architecture section 8, and this design. Resolve each consequential guess
or retain it with a one-line reason it cannot affect a requirement.

Commit the design, traceability update, and accepted requirement corrections on the
branch. Draft the pull-request description using `.github/PULL_REQUEST_TEMPLATE.md`:
include the traced use case, assumptions and corrections, the questions-test result,
and reviewer focus on decisions and architecture changes. Tell the developer that a
teammate who did not author it must review and merge it. Only then start a fresh
Codex session and use `.agents/implement.md` for the same use case.
