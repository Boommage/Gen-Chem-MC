# Open Issues

**Project:** Gen Chem Metacognition
**Team:** Team #4

---

_**What this file is.** Every question about the project that you cannot answer yet, in one place, with the name of the person who can answer it. It is the shortest document in `docs/requirements/` and the one your client meetings run on._

_**Why it exists.** A draft specification with confident guesses in the gaps is more dangerous than one with holes in it, because nobody can tell the guesses from the facts. Writing "we do not know" is not an admission of failure in week 3, it is the correct state. What fails is knowing and not writing it down._

_**Where entries come from.** Three places, and all three are routine:_

- _Drafting a section of [vision-and-scope.md](vision-and-scope.md) and hitting something the client brief does not say._
- _Your agent's list. When you ask it to draft a section, ask it to list every question it could not answer from the material you gave it. Its list is longer than yours and it is not embarrassed to ask obvious things._
- _The meeting itself. Your client says something that contradicts your notes, or answers a question with "I would have to check"._

_**How they leave.** Answered in a client meeting, in Slack, or by reading a document. Record the answer and the date, mark it resolved, and put the substance where it belongs (an objective, a term in the [glossary](project-glossary.md), a business rule). This file is a queue, not a home: an answer that stays here has not been filed._

_**Identifiers here are numbers**, `OI-1` upward, and that is deliberate. Numbers are fine for a list that only ever grows at the bottom and gets cited lightly. The slug convention in [vision-and-scope.md](vision-and-scope.md) exists for identifiers that get **reordered** or **cited often**, which is not this list._

## Before a client meeting

_[Sort the open list by what it costs you to stay wrong, not by what is easy to ask. You will get through fewer questions than you plan to. Take the ones where a wrong guess sends the whole team down the wrong path for a month, and leave the ones you can settle by reading a document or trying the client's current tool yourself.]_

_[Send the shortlist to your client the day before. A client who has seen the questions arrives with answers instead of promises.]_

## Open

| ID | Question | Why it matters | Who can answer | Raised |
|---|---|---|---|---|
| OI-1 | _[The question, phrased so it has a definite answer. Not "tell us about reporting" but "who is allowed to see another student's evaluation scores?"]_ | _[What we get wrong if we guess. Name the artifact or decision it blocks.]_ | _[Client, instructor, a specific user, or the team itself]_ | _[YYYY-MM-DD]_ |
| OI-BNCH-GROWTH | The baseline assessment is one-time, so where do the later measurements that show a student's growth come from: study sessions, reflections, Coach conversations, or short periodic check-ins? | Decides what `UC-BNCH-view-baseline-results` shows and what data must be stored. | Heidi Conrad (client) | 2026-11-20 |
| OI-BNCH-COACH-USE | How should the coach use a student's baseline, for example how many topics and levels, without teaching content (`BR-no-content-teaching`)? | Decides what the baseline stores and how it reaches coaching requests. | Heidi Conrad (client) | 2026-11-20 |
| OI-BNCH-QUESTIONS | In what form, and by when, will the instructor provide the questions, including the correct answer and topic for each chemistry question? | The assessment cannot be built or demonstrated without them. | Heidi Conrad (client) | 2026-11-20 |
| OI-BNCH-COMMON-TERMS | Do common terms come only from text answers in the baseline assessment, or also from Coach conversations (which are not stored today)? What minimum number of responses protects anonymity? | Decides the scope and area of `UC-BNCH-view-common-terms` and its privacy review (`OI-PRIVACY`). | Heidi Conrad (client) | 2026-11-20 |
| OI-INSTRUCTOR-SIGN-IN | How does the instructor sign in, and how is instructor access granted? | Blocks both instructor `BNCH` use cases; no account use case covers the instructor. | Team | 2026-11-20 |

## Resolved

| ID | Question | Answer | Answered by | Date | Filed in |
|---|---|---|---|---|---|
| OI-0 | _[Example row, delete it]_ | _[What we were told]_ | _[Name]_ | _[YYYY-MM-DD]_ | _[`BO-grading-time`, or the glossary term, or the section]_ |
| OI-BNCH-MANDATORY | Is the baseline assessment mandatory? | Yes, on first opening the application after sign-up. | Heidi Conrad | 2026-11-20 | `UC-BNCH-complete-baseline-assessment` |
| OI-BNCH-RETAKE | Can students retake the baseline assessment? | No, it is one-time. `UC-BNCH-retake-baseline-assessment` is withdrawn. | Heidi Conrad | 2026-11-20 | use cases §3 |
| OI-BNCH-PURPOSE | Does the benchmark quiz measure study habits or chemistry knowledge? | Both, with questions the instructor provides to the team. | Heidi Conrad | 2026-11-20 | `FEAT-benchmark-quiz`, glossary: Benchmark Quiz |
| OI-BNCH-VISIBILITY | May the instructor see individual baseline results? | Yes, but with names only for students who agreed to share them. | Heidi Conrad | 2026-11-20 | `BR-student-information-confidentiality`, `SEC-instructor-visibility` |
