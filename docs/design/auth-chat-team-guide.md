# Login and chat history team implementation guide

**Project** Neocortex, Team 4\
**Prepared** November 20, 2026\
**Repository baseline** `main` at `ebf0d96`\
**Shared integration coordinator** Victor\
**Login owners** Zan and Aria\
**Chat history owners** Victor and DJ

This guide defines the directory boundaries, interfaces, visual conventions, and integration sequence for agents working on student login and saved conversations. Use it with [AGENTS.md](../../AGENTS.md), the [use cases](../requirements/use-cases.md), and the selected area's merged design. Directory and interface examples below describe the intended implementation. Create them through the shared foundation and feature PRs described here.

The working plan uses Supabase Auth for student identity, Cloudflare D1 for conversation records, private image storage, and the existing Cloudflare Worker for requests and Gemma. R2 is the proposed image store, subject to the owner's zero-overage requirement. See the [database design](chat.md). The team confirmed that reopened chats must retain both text and images and that Victor coordinates shared changes.

## 1. Agree on the behavior before feature implementation

Use these existing identifiers when writing or extending requirements.

| Team | Existing use case | Scope to draw out |
|---|---|---|
| Zan and Aria | `UC-ACCT-sign-in` | Credentials or provider, account eligibility, verification, session restoration, and failed login. |
| Zan and Aria | `UC-ACCT-sign-out` | End the local session, clear private UI state, and return to account entry. |
| Victor and DJ | `UC-CHAT-start-new-conversation` | Open an empty conversation and define when its saved record is created. |
| Victor and DJ | `UC-CHAT-resume-conversation` | List and reopen the student's saved messages and images and continue the conversation. |
| Victor and DJ | `UC-CHAT-work-through-problem` and `UC-CHAT-share-problem-image` | Persist submitted turns, retain attachments, and recover from model or storage failures. |

The team still needs to answer the following questions in the use cases. Both agents should surface these questions to the feature owners before choosing the affected behavior.

- Which email addresses can register, and which sign-in method ships first? Is email verification required, and does password reset ship in this increment?
- Earlier discussions required a baseline assessment before general app access. Does this increment temporarily admit students to Coach, or include that gate? Record any changed decision and its impact.
- Chats and images expire fourteen days after the last saved message. Do rename, manual deletion, and unsent draft recovery belong in the first release?
- What happens when a student selects New chat, changes conversations, or signs out during generation? Agree on cancellation and any unfinished-turn recovery.
- A conversation is saved when its first message is submitted. What title is shown?

Victor confirmed that a submitted user message is saved before model completion and remains retryable with a failed status if Gemma fails. Student chats remain private. The previously agreed instructor view covers approved metrics and pseudonyms, with chat content excluded from instructor access.

## 2. Directory layout and ownership

Keep the existing `src/`, `backend/`, and `shared/` roots. New feature files use the following locations. Test files live beside the code they exercise.

```text
Gen-Chem-MC/
├── AGENTS.md                              shared integration
├── docs/
│   ├── requirements/use-cases.md           shared document, coordinate sections
│   ├── traceability.md                    shared document, coordinate rows
│   └── design/
│       ├── auth-chat-team-guide.md         this guide
│       ├── acct.md                        login design and test list
│       └── chat.md                        conversation design and test list
└── gen-chem-mc/
    ├── shared/
    │   ├── api.ts                         shared error shape
    │   ├── auth.ts                        AuthUser contract
    │   ├── conversations.ts               saved-chat request and response types
    │   ├── coach.ts                       existing inference types and limits
    │   └── images.ts                      existing image types and validation
    ├── src/
    │   ├── App.tsx                        shared routing and composition
    │   ├── main.tsx                       shared application bootstrap
    │   ├── App.css                        existing shell and Coach styles
    │   ├── index.css                      existing tokens and global defaults
    │   ├── components/
    │   │   ├── AppLayout.tsx               existing shared shell
    │   │   ├── PageHeader.tsx              existing shared header
    │   │   └── CoachMessage.tsx            existing Markdown and math rendering
    │   ├── lib/
    │   │   ├── api.ts                     shared authenticated fetch helper
    │   │   └── imageAttachment.ts         existing image reader
    │   ├── features/
    │   │   ├── auth/                      Zan and Aria
    │   │   │   ├── AuthContext.ts          shared context contract, frozen in foundation
    │   │   │   ├── AuthProvider.tsx
    │   │   │   ├── useAuth.ts
    │   │   │   ├── authClient.ts
    │   │   │   ├── RequireAuth.tsx
    │   │   │   ├── AccountMenu.tsx
    │   │   │   └── auth.css
    │   │   └── chat/                      Victor and DJ
    │   │       ├── ConversationList.tsx
    │   │       ├── useConversations.ts
    │   │       ├── conversationsApi.ts
    │   │       └── chat.css
    │   └── pages/
    │       ├── SignIn.tsx                 Zan and Aria
    │       ├── AuthCallback.tsx           Zan and Aria, if the flow needs it
    │       └── Coach.tsx                  Victor and DJ, extend the existing page
    ├── backend/
    │   ├── worker.ts                      shared default-only Worker entry point
    │   ├── app.ts                         shared routing and authentication boundary
    │   ├── env.ts                         shared Worker binding types
    │   ├── http.ts                        shared JSON/error response helpers
    │   ├── auth/
    │   │   └── requireUser.ts             Zan and Aria, verify Supabase identity
    │   ├── conversations/                 Victor and DJ
    │   │   ├── routes.ts
    │   │   ├── repository.ts
    │   │   ├── service.ts
    │   │   └── attachments.ts
    │   ├── model.ts                       existing inference gateway and legacy handler
    │   ├── policy.ts                      existing coaching policy
    │   └── dev-mock.ts                    existing local mock, shared integration
    ├── migrations/                        Victor and DJ, D1 schema only
    │   └── 0001_conversations.sql
    ├── vite.config.ts                     shared proxy configuration
    ├── wrangler.jsonc                     shared deployment bindings
    ├── package.json                       shared dependencies and commands
    └── package-lock.json                  updated with package.json by one owner
```

Create files when their responsibilities are needed. A second component or helper should earn its place through the design. Keep simple rendering in the existing Coach page instead of extracting every element.

### Shared files have one editor per integration step

Victor coordinates `App.tsx`, `main.tsx`, `AppLayout.tsx`, shared types, `backend/app.ts`, `backend/env.ts`, `backend/http.ts`, `backend/worker.ts`, `backend/model.ts`, `vite.config.ts`, `wrangler.jsonc`, dependency files, global CSS, and the shared requirements and traceability documents.

Feature owners propose a change to these files as a patch or an agreed PR. Victor applies the wiring once against both features. Document each branch's allowed paths in its issue or agent prompt. A necessary change outside those paths goes through the coordinator before editing, so the other branch receives the same interface update.

Zan and Aria own `src/features/auth/`, their account pages, `backend/auth/`, `docs/design/acct.md`, and adjacent tests. Victor and DJ own `src/features/chat/`, `src/pages/Coach.tsx`, its existing tests, `backend/conversations/`, `migrations/`, `docs/design/chat.md`, and adjacent tests.

## 3. Dependency direction

- Browser code imports shared types and validation from `shared/`. Worker code does the same.
- `shared/` contains plain TypeScript types, constants, and pure validation. Its modules import neither `src/` nor `backend/` and use no React, Supabase client, or Worker bindings.
- Browser code calls the Worker over HTTP. SQL, R2 operations, and token verification live in the backend.
- Chat UI reads the public `useAuth` interface below. Supabase SDK calls stay in the auth feature. Auth UI has no dependency on chat internals.
- Conversation handlers receive a verified `AuthUser` from the router. They call the conversation repository for D1, the attachment helper for R2, and the existing model gateway for Gemma.
- Retain explicit imports from concrete modules. Follow existing import style without adding path aliases or broad barrel exports for this increment.

## 4. Freeze these integration interfaces first

The shared foundation PR defines these exports and their tests before either feature branches. These names form the handoff between the two teams. Review changes to them together and update the guide and both branches in the same integration step.

### Shared identity

In `shared/auth.ts` define the following transport-safe type. Use the Supabase subject ID as the stable identity. Email is display data.

```ts
export interface AuthUser {
  id: string
  email: string | null
}
```

### Browser authentication

`AuthProvider.tsx` exports `AuthProvider`. It owns session initialization, Supabase auth subscriptions, token refresh, and cleanup. Mount it once around the app. `useAuth.ts` exports the following public hook. Account screens call the auth feature for the approved sign-in flow.

```ts
import type { AuthUser } from '../../../shared/auth'

export type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'error'; message: string }

export interface AuthContextValue {
  state: AuthState
  getAccessToken(): Promise<string | null>
  signOut(): Promise<void>
}

// Public export implemented by the login team.
export declare function useAuth(): AuthContextValue
```

`getAccessToken` returns a current token for the active user, returns `null` when signed out, and throws a safe error when a refresh service fails. Chat requests obtain it immediately before a call. They clear private state and abort outstanding requests when the signed-in user changes. Ignore late results for an earlier user or selected conversation. Use the authenticated user ID to scope any client cache.

The foundation supplies `AuthContext.ts` with the state/value types and a React context, plus `useAuth.ts` that reads it and reports a missing provider. This hook has no Supabase dependency. Chat tests can mount the context with an explicit fake value while the login team builds `AuthProvider`. The actual provider and feature handlers arrive in their owning PRs. Wire the integrated application once the real provider is available. This keeps both branches compilable without an authenticated-user placeholder in the deployed app.

The auth feature owns `RequireAuth` and `AccountMenu`. Shared app composition supplies the account menu to the shell through one optional `accountMenu` ReactNode slot added to `AppLayout`. Define that prop in the foundation so the login branch can build its menu while the chat branch keeps the shell intact. Preserve the current route mechanism for this increment. The coordinator adds account routes and wraps the protected app with `RequireAuth` after the baseline-entry decision is recorded.

### Worker authentication

`backend/auth/requireUser.ts` exports this function. `WorkerEnv` is the shared binding interface in `backend/env.ts`.

```ts
import type { AuthUser } from '../../shared/auth.ts'
import type { WorkerEnv } from '../env.ts'

export declare function requireUser(
  request: Request,
  env: WorkerEnv,
): Promise<AuthUser | Response>
```

The router checks `result instanceof Response` and returns that response on failure. Otherwise it passes the returned user to the chat handler. The login team verifies the signature, issuer, expiration, intended audience, and subject using the configured Supabase project and supported verification API. Require the account state established by the approved sign-in use case, including email verification if selected. Treat a paused or unreachable Auth service as a service error when online verification is needed. Retain no request's user or token in shared mutable Worker state.

Saved-data endpoints require verified student authentication in local and hosted modes. The shared demo token remains a separate development access control. A supplied `userId` or an unverified JWT payload cannot establish ownership.

`backend/conversations/routes.ts` exports `handleConversations(request: Request, env: WorkerEnv, user: AuthUser): Promise<Response>`. The shared router dispatches the `/api/conversations` route family to that function only after `requireUser` succeeds. The chat team handles the methods and paths in section 5 inside this function. Both teams can test their side without choosing a different HTTP framework or handler convention.

`WorkerEnv` includes the existing model environment plus the fixed Supabase configuration and D1/R2 bindings in section 8. Victor coordinates Cloudflare binding type generation and the backend TypeScript include settings in the foundation PR so feature branches compile against the same environment declaration.

### Browser API helper and JSON errors

`src/lib/api.ts` exports `apiRequest<T>(path: string, accessToken: string, init?: RequestInit): Promise<T>` and `ApiError` with `status`, `code`, and a safe `message`. It forwards `init.signal`, sets `Authorization: Bearer <student access token>`, and sets JSON content type only for JSON bodies. Its response handling supports JSON and understandable failures for non-JSON gateway responses. Endpoints validate actual response fields at the API boundary before using them.

`shared/api.ts` defines `ApiErrorResponse`. `backend/http.ts` exports `json(body, status?)` and `failure(code, message, status)`, keeping the existing error envelope and `Cache-Control: no-store`.

```ts
export interface ApiErrorResponse {
  error: {
    code: string
    message: string
  }
}
```

| HTTP status | Shared meaning |
|---|---|
| 400 | Invalid request, with a safe explanation. |
| 401 | Missing, expired, or invalid student credentials. |
| 404 | Requested conversation or attachment is missing or inaccessible. |
| 409 | Conflicting turn, concurrent operation, or reused request ID with different content. |
| 413 / 415 | Request too large or unsupported content type. |
| 429 | Rate or model allowance exhausted. |
| 502 / 503 / 504 | Unusable upstream reply, unavailable dependency, or timeout. |

Keep provider diagnostics, request bodies, replies, credentials, and raw errors out of responses and logs. Follow the existing usage logging allowlist.

### The Authorization header conflict

The baseline Vite proxy injects the team token into `Authorization`. The baseline model handler reads that same header. A student session also needs `Authorization`.

Victor changes the development proxy to forward the browser's student `Authorization` header and inject the configured team token into `X-Team-Token`. Update the Worker and proxy tests together. Maintain the current header on the existing legacy stateless route for its existing callers during the transition. Allow that legacy authorization only on legacy routes. All saved-data routes require the student token and any configured team-access check. A legacy token or localhost request cannot grant access to saved conversations.

The shared composition test must prove that the proxy preserves the student bearer token and that a valid team token alone is refused on a history endpoint. Plan the eventual student-facing frontend/API origin and CORS configuration before public deployment. A static Vite build has no development proxy.

## 5. Conversation API owned by the chat team

Store public request and response types in `shared/conversations.ts` through the foundation PR. Browser types use camelCase. SQL columns use snake_case. IDs are strings and stored UTC timestamps serialize as ISO 8601 strings. New conversation, turn, and message IDs use UUIDs. The student ID comes from Supabase.

The core DTOs are `ConversationSummary`, `SavedMessage`, `SavedAttachment`, `ConversationPage`, `MessagePage`, `CreateConversationRequest`, `SendTurnRequest`, and `TurnResult`.

| Type | Fields to freeze |
|---|---|
| `ConversationSummary` | `id`, `title`, `createdAt`, `updatedAt`. |
| `SavedAttachment` | `id`, `mimeType`, `width`, `height`, `bytes`. |
| `SavedMessage` | `id`, `conversationId`, `turnId`, `role` (`user` or `assistant`), `content`, `createdAt`, `turnStatus` (`pending`, `completed`, or `failed`), optional `turnError: { code, message }`, optional `attachment`. |
| `ConversationPage` | `conversations: ConversationSummary[]`, `nextCursor: string \| null`. |
| `MessagePage` | `messages: SavedMessage[]`, `nextCursor: string \| null`. |
| `CreateConversationRequest` | `id: string`, allocated once by the client and retained when retrying creation. |
| `SendTurnRequest` | `clientTurnId: string`, `content: string`, optional `image` using the existing `ImageAttachment` type. |
| `TurnResult` | `turnId`, `status` (`pending`, `completed`, or `failed`), `messages: SavedMessage[]`, optional `error: { code, message }`. |

For these routes, `turnId` is the submitted `clientTurnId`, scoped to its conversation. The browser already knows this ID if the POST response is lost and can use it on the recovery endpoint. An attempt ID is an internal server value used when retrying that same turn.

Populate each saved message's turn state from the associated turn record when reading history. That lets a reopened conversation show an interrupted or failed request. The turn record owns the status; the DTO exposes it alongside the message.

`GET` pagination uses stable cursors and fixed bounded pages. Use 20 conversations and 50 messages per page initially. Reject malformed cursors and restrict each page to the verified owner. Conversation lists sort by last activity descending with ID as a tie-breaker. Message pages load the latest page first, display its messages in chronological order, and expose a cursor for older messages.

| Endpoint | Contract |
|---|---|
| `GET /api/conversations?cursor=...` | Return `ConversationPage` for the verified owner. |
| `POST /api/conversations` | Accept `CreateConversationRequest`. Return `{ conversation: ConversationSummary }`, status 201 on creation or 200 on replay of the same owned ID. Creation is safe to retry. |
| `GET /api/conversations/:id/messages?cursor=...` | Return `MessagePage` after checking ownership. |
| `POST /api/conversations/:id/turns` | Accept `SendTurnRequest`. Persist the user turn and request a Gemma reply. Return completed `TurnResult` with 200, or pending `TurnResult` with 202 for a replay still running. On failure use the shared error envelope and retain the turn's safe status for recovery. |
| `GET /api/conversations/:id/turns/:turnId` | Return the stored `TurnResult`, including its failure status, for recovery after a lost response. |
| `GET /api/conversations/:id/attachments/:attachmentId` | Return private image bytes after verifying the conversation owner and attachment relationship. Use the stored MIME type, `nosniff`, and private no-store caching. |

The application stores the conversation's title chosen by the approved New chat use case. Freeze that title behavior before implementation. Only create a record at the trigger agreed in that use case. Retain the allocated conversation ID through network retries. Conversation creation never accepts an owner from the client.

All conversation reads and mutations check ownership through the verified user. A direct-ID request for another student's record returns the same 404 shape as a missing record. Resolve attachments through their owned conversation. Server code loads the stored history and applies `recentConversation` and existing limits before calling Gemma. Model context limits constrain inference independently of how much history is retained for display.

Build the inference context from completed user/assistant pairs plus the current submitted user message. Failed or pending earlier turns remain visible in history with their state but do not create unmatched user messages in Gemma's alternating context. Persist an assistant message only with the successful finalization of its turn.

### Preserve the current Coach implementation

Reuse `CoachMessage`, `readImageFile`, `inspectImage`, image bounds, `recentConversation`, the Thinking indicator, and the existing inference policy and output formatting. Persist the existing Markdown/math reply text. Keep the model request's reasoning-disabled setting and final-reply validation.

In the foundation PR, Victor extracts the existing generation path into `generateCoachingReply(messages, env, timeoutMs?)` in `backend/model.ts`, returning `{ reply, model }` or a typed safe inference failure. Keep `createHandler` as the existing stateless transport wrapper so current gateway and mock tests can continue to exercise it. The new conversation service calls the extracted generation function with server-loaded context. The team-token HTTP handler cannot serve as the internal inference API for authenticated chat.

The shared application router composes the legacy route and the new authenticated handlers. `backend/worker.ts` keeps a single default export. Each feature's tests import its concrete module. Named helpers belong outside the Worker entry point.

## 6. Database and image boundaries

The chat team owns versioned D1 migration files. The first migration establishes conversation ownership and the message/turn relationships. The detailed SQL and constraints belong in `docs/design/chat.md` and its reviewed migration.

| Record | Relationships and constraints |
|---|---|
| `conversations` | UUID primary key and indexed `user_id` equal to the verified Supabase subject. List by owner and last activity. |
| `turns` | Belongs to a conversation. Unique client request ID within that conversation, status, attempt identifier, and timing support safe retry and recovery. |
| `messages` | Belongs to a conversation and turn. Stable message IDs and ordering. At most one user message and one accepted assistant message per turn. |
| `attachments` | Belongs to the saved user message. Records MIME type, dimensions, byte size, and the private R2 object key. |

Supabase owns authentication records. A cross-provider user ID in D1 is an application association, with account lifecycle and deletion coordinated by the Worker. D1 cannot enforce a foreign key to Supabase's database. Any local student profile references that same stable subject.

Use prepared statements and bound values. D1 supports transactional batches. An inference call runs between short database operations, outside a transaction. Reserve the user turn atomically, run the model, and finalize the assistant message and status atomically. Enforce one in-flight turn per conversation with database constraints or conditional writes, including submissions from different tabs or Worker instances. Specify the exact SQL in the chat design.

A retried `clientTurnId` with the same input reuses its existing turn. A completed replay returns its stored result without spending inference again. A running replay reports pending. A failed turn can start one new attempt while retaining its user message. A replay with different text or image identity is a conflict. Editing a failed message creates a new turn under the behavior agreed in the use case.

Bound pending-turn lifetime. A Worker crash or lost browser connection must leave a recoverable state. Use attempt IDs and conditional finalization so a late result cannot overwrite a newer attempt. Agree on the lease duration and recovery policy in `docs/design/chat.md`; the frontend cannot guarantee that aborting fetch cancels Gemma.

Images persist in a private R2 bucket so reopened chats can show them and include them in bounded model context. Validate actual bytes on the server. Keep the database reference and object lifecycle consistent across failed writes and retries using stable object keys and an explicit cleanup plan. Account for storage failures before claiming a message was saved.

The browser fetches a private attachment using its access token and displays a blob object URL, then revokes the URL on cleanup. A plain image URL cannot attach the Authorization header. Public bucket URLs and access tokens in query strings would expose the file outside the authenticated request flow.

## 7. Code and visual conventions for both agents

- Follow current TypeScript and React conventions. Use two-space indentation, single quotes in TypeScript, named types for boundary data, and explicit type imports. Use PascalCase for component files and camelCase for functions and hooks. Keep `strict` TypeScript checking.
- Use function components and React hooks. Keep app state local to the owning feature, with `AuthProvider` as the shared source of session state. Match the existing default export style for components and named exports for helpers.
- Parse network data as `unknown` and validate before use. Handle empty, loading, unavailable, and unauthorized states explicitly. Preserve AbortSignal handling and prevent stale requests from changing another user's view.
- Keep Supabase SDK details in `authClient.ts`, SQL in `repository.ts`, R2 access in `attachments.ts`, and coordination in `service.ts`. Prefer direct functions and the existing Web APIs over a new application framework or generic repository hierarchy.
- Use the existing `AppLayout`, `PageHeader`, `Icon`, and `CoachMessage`. Preserve the green palette, Inter body font, Georgia headings, and CSS variables in `src/index.css`.
- New auth selectors use the `auth-` prefix in `auth.css`. New history selectors use `chat-` in `chat.css`. Existing Coach selectors stay in `App.css` until a coordinated move is useful. Feature styles do not redefine global tags, root tokens, `.message`, or `.app-shell`.
- Keep labels visible, inputs associated with labels, controls keyboard accessible, and pending/error feedback announced appropriately. Use existing focus styles and the 760 px responsive breakpoint. Verify narrow layouts at 320 px.
- Preserve accessible Thinking feedback, image previews, math rendering, and Retry/Edit behavior while adding persistence. Any product behavior change goes into the use case and its tests.
- Dependency changes go through Victor in one PR. Confirm packages and the intended version before adding them. The Supabase SDK is the expected authentication dependency; confirm the verification approach before adding a separate JWT package. Both agents start from the same lockfile.
- Follow AGENTS.md for secrets and logging. Show sanitized errors to the user, and keep logging to approved operational fields.

## 8. Configuration ownership

These are proposed setting names for the foundation PR. Configuration examples belong in setup documentation. Each developer enters actual values privately, following the repository's secret-read restrictions.

| Setting | Used by | Exposure and owner |
|---|---|---|
| `VITE_SUPABASE_URL` | Browser auth client | Public project URL. Victor coordinates the documented name. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser auth client | Public client key by design. Login team confirms project configuration. |
| `SUPABASE_URL` | Worker verification | Fixed expected project URL, configured server-side. |
| `SUPABASE_PUBLISHABLE_KEY` | Worker verification when needed | Public client key, configured server-side for the selected SDK method. |
| `DB` | Worker | D1 binding. Chat team supplies the schema and Victor adds the binding. |
| `CHAT_IMAGES` | Worker | Private R2 binding. Chat team implements access and Victor adds the binding. |
| `AI` | Worker | Existing Workers AI binding. |
| `COACH_API_URL` / `COACH_API_TOKEN` | Local Vite proxy | Existing settings. The token stays server-side. |
| `TEAM_API_TOKEN` | Hosted team Worker | Existing secret, used for the optional team access check. |

Only explicitly public Supabase configuration receives a `VITE_` prefix. Secret keys, team tokens, and privileged Supabase keys stay outside the browser bundle. Use the Supabase SDK's session storage behavior instead of creating a separate token store.

Scope D1 and R2 bindings to the actual Wrangler environments, including `team`. Keep migration files committed and environment resource IDs configured by the coordinator. Both teams use one agreed development project, with distinct test accounts, and a local/mock setup that explicitly represents signed-in test identities. Production route handlers still execute identity checks.

For shared endpoint development, `npm run dev` runs the frontend and the deployed Worker runs the API. For local Worker development, run `npm run dev:api` separately. Use `npm.cmd` on Windows when necessary, and `npm` on Linux/macOS. Run commands inside `gen-chem-mc`. The shared setup PR documents any additional local D1 migration commands once the schema exists.

## 9. Parallel development and merge sequence

1. **Document the use cases.** Resolve the product questions in section 1 with the feature owners and record accepted answers. Use the existing per-area design workflow for the selected use cases. Review the architecture changes for Supabase Auth plus D1/R2 before feature builds.
2. **Merge a small shared foundation PR.** Victor coordinates both teams to add shared contracts, the frontend auth context and public hook, helper boundaries, binding types, the account-menu slot, proxy header fix, and inference extraction. Include compatibility tests for the current Coach routes and request headers. Existing Coach must remain usable on the intended prototype path while feature code is being developed.
3. **Branch both teams from that same foundation commit.** Use separate checkouts or Git worktrees. One agent works on the login paths, another on the chat paths. Record the common foundation SHA and owned paths in both issues.
4. **Develop against the same contracts.** Chat component tests provide `useAuth` with a fake authenticated user and fake transport. Chat backend tests receive an explicit verified test user. Login tests replace Supabase transport. These fixtures live in tests and do not enable a shared-user bypass in deployed endpoints.
5. **Merge feature work in use-case-sized PRs.** Follow the repository's review process and design test lists. The login work supplies real session acquisition and Worker verification. Chat work supplies owner-scoped persistence and image access. Victor performs the final app/router wiring against both implementations.
6. **Verify the integrated branch.** Run the checks below with both features. Review every shared-file diff, schema migration, and dependency change. Deploy only after the merged behavior is ready for the existing team endpoint.

Example worktree commands, run from the repository root after the shared foundation is on `main` and local work has been saved.

```powershell
git fetch origin
git worktree add -b codex/student-login ../neocortex-login origin/main
git worktree add -b codex/chat-history ../neocortex-chat-history origin/main
```

Each agent runs `git status` and reads AGENTS.md in its own worktree before editing. It commits and pushes only its assigned branch. Shared interfaces change through Victor, who supplies the update to both branches. Merge or rebase the common updates before integration testing. Keep existing human and agent attribution trailers.

## 10. Required handoff checks

| Area | Evidence the owner supplies |
|---|---|
| Login | Approved sign-in and sign-out flows, verification/recovery if selected, session initialization and refresh, invalid/expired token handling, and safe clearing of state on account change. |
| History | New chat, saved text and images after reload, paginated lists, resume and follow-up, pending/failed turns, safe creation/send retries, and the approved switch/cancel behavior. |
| Ownership | Two real test accounts. Student A cannot list, open, mutate, or fetch Student B's chats or attachments, including guessed IDs. Missing credentials and a team token alone cannot read saved records. |
| Concurrency | Replayed creation, duplicate send after a lost response, two tabs submitting, expired pending attempts, and late model completion preserve one accepted reply per turn. |
| Existing Coach | Text, image, retained-image follow-up, Thinking, Markdown/math, safe usage logging, and current model reasoning settings still pass their regression checks. |
| Integration | Student bearer token survives the proxy. The same verified user reaches D1 queries. Sign-out/account switch clears old content and pending responses. The deployed frontend has a configured API origin. |

Run `npm run check` from `gen-chem-mc`, plus a Wrangler dry run for the intended environment when Worker bindings change. Tests should exercise approved use-case main flows and extensions. Verification status in traceability follows the evidence. Include shared-file changes and any unresolved product decisions in each PR's handoff.

## 11. Copyable instructions for the two agents

### Login agent

> Read AGENTS.md, docs/design/auth-chat-team-guide.md, and the merged account use case and design. Implement the assigned account use case inside src/features/auth/, the agreed account pages, and backend/auth/. Use the shared AuthUser, AuthContextValue, and requireUser contracts. Reuse the current visual system. Victor coordinates app wiring, shared files, dependencies, and proxy changes. Ask the feature owners about any unresolved product behavior. Verify your design's main flow and extensions, preserve attribution, and open a PR on your assigned branch.

### Chat agent

> Read AGENTS.md, docs/design/auth-chat-team-guide.md, and the merged conversation use case and design. Implement the assigned chat use case inside src/features/chat/, the existing Coach page, backend/conversations/, and D1 migrations. Use useAuth and the authenticated API helper. Scope every record to the verified Supabase subject. Save text and private R2 images, preserve existing Coach formatting and recovery features, and implement retries against stable conversation and turn IDs. Victor coordinates shared files, dependencies, and final wiring. Ask the feature owners about any unresolved product behavior. Verify ownership, failure, and concurrency flows and open a PR on your assigned branch.

## References

- [Repository architecture](architectural-design.md) and [requirements](../requirements/use-cases.md).
- [Supabase JWT verification](https://supabase.com/docs/guides/auth/jwts) and [verified claims API](https://supabase.com/docs/reference/javascript/auth-getclaims).
- [D1 database binding and transactional batches](https://developers.cloudflare.com/d1/worker-api/d1-database/).
