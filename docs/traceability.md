# Traceability Matrix

**Project:** Gen Chem Metacognition
**Team:** Team #4
**Version:** 0.1
**Last checked:** _[2026-09-22, by Giang Tran]_

---

_**How to use this template.** Instructions appear in italic square brackets. Fill in underneath them and leave them in place until the document is stable._

_**What this file is.** The map of your project, from the reason something exists to the thing that does it. Every other document owns its own contents; this one owns the **links between them**, so nobody has to restate anything to find out what connects to what._

_**Why it exists before any code does.** The question it answers in week 4 is "did we specify everything we promised, and nothing we did not?" The question it answers in week 12 is "this broke, what was it supposed to do, and who asked for it?" Those are the same question, and the file that answers the second one is the file you started in week 4. Starting it later means reconstructing links from memory, which is the same work done worse._

_**It grows.** Week 4 fills in two tables. Week 8 adds the columns for design, code, and tests once those exist, and the tables below leave room for them. Do not add empty columns now._

_**Run the checks by hand this week.** Each table below ends with two checks. They are cheap, and they fail loudly. Hand the whole file to your agent and ask it to run them, then verify what it tells you, because a check reported as passing by the thing that also wrote the table is not evidence._

---

## 1. Feature to use case area

_[Your vision and scope lists product **features** (`FEAT-<slug>`), each a capability a stakeholder can see. Your use case file groups behavior into **use case areas** (`UC-<AREA>-*`). This table connects them, and it is where **business objectives attach**: the objective hangs on the feature, and every use case underneath inherits it. That is why the objective is named here once, rather than repeated on forty use cases._

_Features and areas are deliberately many-to-many. A feature that lands on exactly one area is probably too narrow, and a feature that reads "create, edit, and delete X" is a list of use cases wearing a feature's clothes._

_Worked example, from Project Pulse:]_

| Feature | Business objectives | Use case areas |
|---|---|---|
| `FEAT-performance-tracking` | `BO-PERF-instructor-efficiency`, `BO-PERF-student-participation` | `WAR`, `EVA` |
| `FEAT-administration` | (enabling, serves no objective directly) | `SEC`, `TEA`, `STU`, `INS`, `ACC`, `RUB` |

_[An enabling feature that serves no measurable objective on its own says so, as the second row does. That is different from forgetting to fill the column in.]_

**Checks.**

1. **Every feature has at least one area.** A feature with none means your vision promises something nobody has specified.
2. **Every area is reached by a feature.** An area no feature points at means you have use cases no stakeholder asked for.

---

## 2. Business rule to what enforces it

_[A business rule is a property of your client's business, so it has no implementation of its own. What it has is a set of requirements that enforce it, and this table is how you find them. Rules are **cited, never restated**: the rule's text lives in `business-rules.md` and nowhere else, and this table holds only the identifier and the links._

_The **Source** column is duplicated here from `business-rules.md` on purpose, and it is the one exception in this file. It is the column reviewers and clients actually read, and a rule whose source is one click away is a rule nobody checks._

_Worked example, from Project Pulse:]_

| Business rule | Source | Enforced by |
|---|---|---|
| `BR-evaluation-submission-window` | Not recorded | `UC-EVA-submit-evaluation` step 7 and extension 1b |
| `BR-section-admin-only` | Not recorded | `UC-RUB-assign-rubric`, `UC-SEC-create-section`, `UC-SEC-edit-section`, `UC-SEC-setup-active-weeks` |

**Checks.**

1. **Every rule is enforced by something.** A rule with an empty third column is a policy your software ignores. That may be the right answer, and it is only the right answer if you decided it on purpose. Write the decision in `OPEN-ISSUES.md` rather than leaving the cell blank.
2. **Every requirement that cites a rule cites one that exists.** Search your use cases and specification for every `BR-` identifier and confirm each one is defined in `business-rules.md`. This is the check that catches a draft citing `BR-late-penalty` because a late penalty is the kind of thing a course usually has. A generated document cites plausible identifiers with complete confidence, and nothing else in your process will notice.

---

## Functional traceability matrix

> `/design` runs in two beats: it first sets a use case's **Build** to `🔬 Problem-validated` once its challenge loop has firmed the use case (spec fixes looped back), then to `📐 Designed` — filling the **Design** column with the area's design-of-record — when the solution design is approved (trivial use cases reach `📐` in one motion); `/implement` fills the code columns, sets **Build**, and fills **Verify** at the end of its run (Phase 5).

### How to use it

- **One row per use case**, in `UC-<AREA>-<slug>` order, mirroring `requirements/use-cases.md`.
- **Build** — construction state of the code, from the Build legend below (`❌` → `🔬` → `📐` → `🟡` → `✅`). It says nothing about tests; `✅ Built` is a claim about code only.
- **Verify** — whether automated tests exercise and pass for the built behavior, from the Verify legend below. Deliberately **independent of Build**: a `✅ Built` use case with no test reads `🔎 None` here, so "done" can never hide an untested flow. `—` until there is built behavior to verify (Build is `❌`/`🔬`/`📐`). RAM has no frontend automated tests yet (see the matrix note), so a built RAM use case's Verify reflects its **backend** test coverage; that frontend-test gap is recorded once rather than per row.
- **Release:** the release plan, the tag in which the row's code ships, from the Release legend below. Build and Verify say where the work is; Release says when it is planned to be done. It tracks Build only: a shipped row whose Verify is `🔎 None` or `🟡 Partial` keeps its Release, and its missing tests are test debt, visible in Verify and tracked as an issue. Set it when the row is added, and revise it when a use case closes or the scope changes; the pull request that changes a Release cell says why. Scope is not set here: a use case whose `**Status:**` line marks it Deferred or Tabled (see the use-case lifecycle status convention in [`AGENTS.md`](AGENTS.md)) is out of the MVP, and its Release cell stays empty. On any other row, an empty cell is unplanned work.
- **FR IDs** — the SRS's non-use-case, system-level functional requirements this use case **depends on / builds upon** (e.g. autosave, validation, real-time collaboration, AI), and, where relevant, the External Interface Requirements (`SI-*`) that carry the use case's interface detail (export formats/fidelity, import allowlist/extraction). The use case's own "The system …" steps are its primary acceptance criteria; this column points to the reusable cross-cutting subsystems behind it. **This column is deliberately non-exhaustive — read it as additive over a universal baseline, not as the complete FR set for the row.** The most universal behaviors — RBAC (`FR-SEC-*`) and authorship metadata (`FR-HIS-authorship-metadata`) — apply to **nearly every** row, so they are an **implicit baseline omitted from every cell** to reduce noise: their absence from a row is **never informative** — it never means the use case escapes authorization or authorship. The column therefore lists only the *additional* cross-cutting FRs a use case draws on **beyond** that baseline, and **`—` means "none beyond the baseline"** (the use case is otherwise self-contained — its own steps are the whole spec), **not** "this use case has no security or authorship dimension." Section locking is part of the editing use cases' own steps (governed by `BR-edit-lock-required` / `BR-lock-expiry`), not a separate FR.
- **Design** — the area's design-of-record (`design/<area>.md`, optionally anchored to the use case's sequence diagram under *Sequence*, the one per-use-case heading the doc carries) once `/design` has written it and its pull request has merged; `—` until then. A single area doc covers every use case in its area, so rows in the same area cite the same file.
- **Frontend / Backend / Tests** — concrete artifacts (`file_path` or component/class names) once built; `—` until then.
- **Extension coverage (convention).** Because tests are tagged to the **whole use case** — there are no per-step or per-extension IDs — the **Tests** cell names *which extensions* a test exercises, e.g. `…AddEvaluation… + matching extensions (E1,E3); E2 untested`. This keeps edge-case coverage visible: a `✅ Verified` row whose negative/exception flows are only partly tested shows `🟡 Partial` in Verify with the gap spelled out in Tests. `/sync-check` flags any `✅ Built` use case whose count of negative-path tests is below its number of extensions (a heuristic that surfaces likely-undertested exception behavior). Back-filling the per-extension annotation across the already-built use cases is a `/sync-check` sweep, not a precondition for the convention.
- When a use case is added to `requirements/use-cases.md`, add its row here (Build `❌ Not started`, Verify `—`, and a Release value). `/design` advances Build to `🔬 Problem-validated` once the use case is firmed, then `📐 Designed` when the solution design is approved; when `/implement` finishes it, set Build, fill Verify, and fill the code columns.

### Build legend

| Symbol | Meaning |
|--------|---------|
| ❌ Not started | No design, no code; the use case is unexamined. |
| 🔬 Problem-validated | `/design`'s challenge loop has run against the use case — ambiguities, contradictions, and assumptions that break against the code surfaced and looped back into the spec; the problem statement is firm. No solution design yet. (The `❌ → 🔬` transition **is** a recorded challenge event; its evidence is the spec diff that produced it.) |
| 📐 Designed | Solution approved — the area's `design/<area>.md` is written (`/design`) and approved by merging its pull request, with the questions-test result in the pull request description; not yet coded. |
| 🟡 In progress | Partially built (e.g., backend complete, frontend pending). |
| ✅ Built | Code complete for the use case's flow. **Makes no claim about tests** — see the Verify column. |

### Verify legend

| Symbol | Meaning |
|--------|---------|
| ✅ Verified | Automated test(s) exercise the built behavior — main flow and extensions — and pass. |
| 🟡 Partial | Some flows/extensions are tested; others are not (the Tests cell names the gap). |
| 🔎 None | Built, but no (or insufficient) automated test exists. |
| — | Nothing built to verify yet (Build is `❌`, `🔬`, or `📐`). |

### Release legend

| Value | Meaning |
|-------|---------|
| ≤ v1.5.0 | Shipped before the release plan began (planning started with the work left after `v1.5.0`). |
| v1.6.0, v1.7.0, … | The planned release tag. The next tag is the one being worked toward; later tags are the planned order. |
| Later | In scope, not yet scheduled. |
| (empty) | Only on a use case whose `**Status:**` line marks it Deferred or Tabled; that line owns its scope. |

The planned releases, in order: `v1.6.0` the reminders (the on-demand one, and the scheduled one brought in line with `BR-submission-owed`); `v1.7.0` the rest of RAM authoring (artifact and link screens, comments, review, export); `v1.8.0` the first AI assistant end to end (critique and the proposal loop, the assistant settings it needs, and the LLM proxy with `QS-llm-outage` measured); `v1.9.0` ReqLint and the tutor; `v2.0.0` the remaining assistants, for the Fall 2027 classroom deployment.

> **Foundation & performance-tracking rows (`UC-RUB-*`, `UC-SEC-*`, `UC-TEA-*`, `UC-STU-*`, `UC-INS-*`, `UC-ACC-*`, `UC-WAR-*`, `UC-EVA-*`).** These are the established, in-production course-management, weekly-activity-report, and peer-evaluation features. Their concrete spec→code mapping was filled in by **design-as-built code archaeology**


| UC | Use Case | Build | Verify | Release | FR IDs | Design | Frontend | Backend | Tests |
|----|----------|-------|--------|--------|--------|----------|---------|-------|---------|
| UC-BNCH-complete-baseline-assessment | Student completes onboarding assesment | ❌ Built | ❌ Verified | Later | — | — | — | — | — |



## Working this document with your agent

_[Delegate: running both checks and reporting what fails; finding every `BR-`, `FEAT-`, and `UC-` identifier cited anywhere in `docs/` and listing the ones with no definition; regenerating the second table from the Business Rules fields of your use cases after you have edited them._

_Keep human: whether an area with no feature is a missing feature or a use case that should not exist, and whether an unenforced rule is an oversight or a decision. Both are questions about your client's business, and the answer is not in your repository._

_**The specific failure to watch for:** an agent asked to "fill in the traceability matrix" produces a complete, well-formed table in which every cell is populated and some of the links are invented. A blank cell is information. A confidently wrong link is worse than no link, because it makes the check pass. Verify every row you did not write yourself by opening the document at the other end.]_