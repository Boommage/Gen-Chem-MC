# Codex workflows

This repository keeps the detailed, opt-in course workflows in `.agents/`.

- When the developer asks to **design a use case**, read and follow
  `.agents/design.md` before acting.
- When the developer asks to **implement/build a designed use case**, read and
  follow `.agents/implement.md` before acting.

These workflows are deliberately not implicit: apply one only when the developer
explicitly requests that stage or names its workflow file.

## Coordinated login and chat work

Before working on student login or saved conversations, read
[the team implementation guide](docs/design/auth-chat-team-guide.md). Follow its
directory ownership, shared interfaces, and existing visual conventions. Zan and
Aria own login, Victor and DJ own chat history, and Victor coordinates shared
files and integration. Use the selected use case and its merged design for product
behavior, and raise unresolved choices with the feature owners.

## The agent must not

- **Break the dependency rule.** `gen-chem-mc/src/` and `gen-chem-mc/backend/`
  may import from `gen-chem-mc/shared/`; `shared/` imports from neither, and
  `src/` never imports from `backend/`.
- **Mark a row in `docs/traceability.md` as ✅ Verified** unless a passing test
  covers the main flow and every extension. Otherwise use 🟡 Partial and name
  the untested extensions. Every link added to that file must be opened to
  confirm it resolves.
  *(From review: [commit comment](https://github.com/Boommage/Gen-Chem-MC/commit/44ddd6d5bbd70e0a4802df86bbefbf955b37bfba#commitcomment-211061264)
  on PR #28)*
- **Log request bodies, model responses, error objects, tokens or credentials.**
  Add fields to the `logUsage` allowlist in `backend/model.ts` instead.
- **Change `backend/policy.ts`** without keeping its policy and
  reasoning-disabled tests in `backend/model.test.ts` passing.
- **Read secret locations:** `.dev.vars`, `.env*`, or any file holding
  `TEAM_API_TOKEN`.
- **Remove the `Co-Authored-By` trailer** from a commit it helped write.
