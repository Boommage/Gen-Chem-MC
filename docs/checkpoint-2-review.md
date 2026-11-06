# Neocortex Checkpoint 2 review

**Team 4 · November 9, 2026**\
**Prototype reference:** `main` at `fe52c63`, including the [merged Gemma text and image integration](https://github.com/Boommage/Gen-Chem-MC/pull/22). This review documents the frozen prototype and the next use cases.

## What to demonstrate

The browser runs the React/TypeScript app through Vite. The shared TypeScript Cloudflare Worker invokes hosted Gemma through Workers AI. One model and endpoint handle text, images, and follow-ups that refer to either. The team token authorizes requests to the demo backend. The chat transcript lives in the open Coach page.

1. Follow the [team setup](gemma-setup.md), keep the existing shared URL and token, and open Coach at `http://127.0.0.1:5173/coach`.
2. Send a short text question. Watch for the Thinking indicator and the formatted final reply. Ask a follow-up in the same conversation.
3. Attach a fabricated JPEG or PNG of a chemistry problem. Ask “What should I identify first?” Then send a text-only follow-up about the image.
4. Ask for a direct solution, then try a correct answer you have justified. Compare the replies with the coaching rule. Record deviations separately from whether the request succeeded.
5. Leave Coach for Study and return. Show that the chat resets. Study and Progress currently provide navigation and page shells.
6. If demonstrating failure recovery, use a stubbed backend failure. Verify the error, Retry/Edit controls, and navigation to another page.

The reference checkout passed `npm run check` (lint, API type-check, **97 tests**, and the frontend build). PR #22 records live text and image smoke tests. The automated suite covers UI, request handling, and formatting. The team still needs a model behavior evaluation and class-size load measurements.

## Conflicts and resolutions

| Finding | Checkpoint 2 resolution |
|---|---|
| The teammate's audit used a different model branch. Architecture still described Python and one Vercel deployment. The setup guide also pointed to the merged feature branch. | Review `main` and document Vite, the TypeScript Worker, and hosted Gemma. Preserve the earlier decision as superseded for this prototype. The shared Worker accepts the team token from the proxy. The local Vite listener and the hosted Worker have different access boundaries. |
| `SAF-ai-guidance` allowed a final answer after a hint. The audit also described a two-attempt leak checker. | Align requirements with the client rule. Coach guides without supplying the solution or full breakdown and may confirm a correct student-produced answer after the student explains it. The Worker uses instructions and structural response checks. Multi-turn and image answer leakage still needs evaluation. |
| The glossary called the baseline a knowledge quiz. The merged design covered submission only. | Specify a study-habits assessment required after the first successful sign-in. Students can save and resume the assessment. Completion initializes default study preferences and unlocks the app. Review the three changes in the baseline design before implementation. |
| The old privacy rule described anonymity and the architecture listed instructor access to student usage figures. | Under future Private mode, instructors see approved per-student metrics under a pseudonym and class averages. Chat, reflections, and baseline answers stay private. Decide the exact metrics, retention, and visibility outside Private with the client before persisting student data. |
| Same-page follow-up, saved chat, and instructor-provided context were easy to conflate. | Only same-page follow-up is built. Saved chat requires student identity and private persistence. A student's problem image is request input. Instructor-approved course grounding remains a separate scope gap. |
| Traceability mixed another project's examples with contradictory baseline statuses. The published MVP is broader than the Monday demo. | Use one built Coach row and five future rows. Keep the original baseline submission design linked as design evidence. Flag approved course grounding, outside-study logging, and structured reflection for scope review. |

## After Checkpoint 2

1. Settle student authentication, ownership, data retention, and the baseline design changes. Separate the shared prototype token from the future student access model.
2. Build private chat resume and the timed study flow once identity and storage decisions are in place. Ask for confidence before and after each timed session. Build student Progress from recorded sessions.
3. Review the scope gaps with the client. Define a repeatable answer-leak evaluation with fabricated text, image, and multi-turn cases before evaluating classroom readiness. Confirm production ownership and measure hosted usage against class traffic.

[Use cases](requirements/use-cases.md) · [Traceability](traceability.md) · [Open issues](requirements/OPEN-ISSUES.md) · [Architecture](design/architectural-design.md)
