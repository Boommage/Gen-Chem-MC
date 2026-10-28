---
name: implement
description: Build one use case from its merged design-of-record, test it, update traceability, and prepare a pull request.
argument-hint: <UC-ID> (for example, UC-BNCH-complete-baseline-assessment)
---

# Implement a designed use case

Use this instruction when asked to build a `UC-*` use case. Treat the argument as
`UC-ID`. This is the second stage of the workflow: build from the merged
design-of-record, not from a prior design conversation.

## Preconditions

Determine the lowercase use-case area and confirm that `main` contains
`docs/design/<area>.md`, its **Realizes** section lists the requested `UC-*`, and
the row in `docs/traceability.md` says `📐 Designed`. If any check fails, stop and
tell the developer to use `.agents/design.md <UC-ID>` first. Do not design while
building.

This work must begin in a fresh Codex session. If the session contains the design
conversation or unrelated implementation context, ask the developer to start a new
session. A question the design does not answer is a design gap: ask about it, update
the design on this branch when resolved, and call it out for review.

The specification and design are authoritative but fallible. Raise ambiguity,
contradiction, stale constraints, or unsupported assumptions before coding. Propose
the necessary requirement or design correction; do not silently comply or add
unrequested improvements. If no ID was provided, ask for one (or list traceability
rows whose Build state is `📐 Designed`, earliest release first).

## Phase 1 — understand (read only)

Read these sources and verify all identifiers they cite:

1. `docs/design/<area>.md`: diagrams, components, API contract, decisions, data
   model, and especially the complete test list.
2. The identified use case and all its main and extension flows in
   `docs/requirements/use-cases.md`.
3. Its rules, requirements, and quality attributes in the requirements documents.
4. `docs/requirements/project-glossary.md`.
5. The relevant components and all of section 8 of
   `docs/design/architectural-design.md`, including security and crosscutting rules.
6. `AGENTS.md`, if present, the traceability row, and the code named by the design.

Use the glossary in identifiers and UI text. Prefer the architecture conventions over
inconsistent prototype code, and note code drift for review. Stop now if the design,
requirements, or code conflict.

## Phase 2 — plan

State a concise plan, then proceed unless there is a real blocker. It must cover:

- testable acceptance criteria for the main scenario and every extension;
- frontend and backend changes that realize the components and API contract,
  including endpoint authorization;
- every design-test-list row mapped to the test that will satisfy it;
- departures from the design (which require a design update);
- which commits are trunk/shared code and which are leaves; and
- open questions and risks.

If a refactor not named by the design is necessary, stop before code changes. Explain
what will change, why the use case needs it, and every location using the old shape.
Proceed only after explicit developer approval.

## Phase 3 — build in reviewable commits

Work on a branch, never directly on `main`, and commit in steps that follow the
design.

- An approved refactor is its own first commit, changes no behavior, and leaves
  existing tests green before and after.
- Put trunk/shared behavior in its own commit, then pause and ask the developer to
  review that commit and explain its purpose before making leaves.
- Use one commit per leaf endpoint, view, or job. A security rule or schema migration
  is always its own commit. A small no-trunk change may be one commit.
- Include and run targeted tests with the code each commit adds.
- Keep scope to the selected use case. List unrelated cleanup as reviewer follow-up.
  If implementation changes the design, update `docs/design/<area>.md` to match.

## Phase 4 — test and verify

1. Ensure every design test-list row, including every extension, has a test whose
   assertions derive from the use case and rules rather than current behavior.
2. Inspect the diff against architecture section 8. Verify error shape, time,
   identity, authorization, and every other applicable crosscutting rule. Each new
   endpoint needs its access rule and refusal tests.
3. Run the complete project test suites after all commits; run the feature manually
   where practical for the main scenario.
4. Report accurately what passed, what was skipped, and why.

## Phase 5 — trace and prepare review

Update the selected traceability row. Set **Build** to `🟡 In progress` or
`✅ Built`; list Code and Tests and identify covered extensions. Set **Verify** to
`✅ Verified` only when the main flow and every extension are covered and passing;
otherwise use `🟡 Partial` with the gap in Tests, or `🔎 None` when no tests exist.
Do not disguise built-but-untested work.

Draft a pull request from `.github/PULL_REQUEST_TEMPLATE.md`, keeping each section
to three lines or fewer:

- **Traces to:** the use case and design file.
- **How it was verified:** each test-list row and covering test, commands run, and
  all unverified or skipped flows.
- **Reviewer focus:** trunk/refactor commits, shared or security changes, and every
  design change.

Recommend a fresh-context Codex review before human review. Hand off the pull request
to a teammate who did not author it; the use case is complete only after that review
and merge.
