# Chat database foundation

**Prepared** November 20, 2026
**Baseline** `main` at `f8e26ae`
**Team owners** Victor and DJ, with Victor coordinating shared files

## Purpose

This storage foundation supports `UC-CHAT-start-new-conversation`, `UC-CHAT-resume-conversation`, `UC-CHAT-work-through-problem`, and `UC-CHAT-share-problem-image`. The [team guide](auth-chat-team-guide.md) owns the parallel-development contracts.

The implemented part is a versioned D1 schema and Worker configuration. Student session verification, HTTP persistence routes, R2 object operations, and the Coach history UI are subsequent integrations. The owner confirmed that conversations are saved on first submission, failed user messages remain retryable, and chats and images have automatic 14-day retention. Retention runs from the last saved user or assistant message. Hosted image storage and its billing safeguards are still being reviewed.

## Records and relationships

| Table | Purpose and constraints |
|---|---|
| `conversations` | Stores a conversation ID, Supabase subject in `user_id`, title, and UTC timestamps. Owner/activity index supports the history list. Empty titles support allocation before the approved title is assigned. |
| `turns` | Uses the composite key `(conversation_id, id)`. The ID is the client's stable turn ID. Tracks ordered turns, pending/completed/failed state, attempt identity/time, and safe failure details. Only one pending turn can exist per conversation. |
| `messages` | Stores text associated with a conversation and turn. At most one user message and one assistant message can belong to that turn. A composite foreign key prevents linking a message to another conversation's turn. |
| `attachments` | Stores private image object metadata associated with a user message in the same conversation. At most one attachment per message. Keys are unique. Byte, dimension, MIME, and pixel constraints follow the current image limits. |
| `image_deletions` | Durable cleanup queue populated in the same transaction that removes an attachment. The image service removes its object before acknowledging the queue row. |

Supabase Auth issues account IDs. D1 stores the subject association, while authentication determines whether a caller owns it. The Worker must derive that subject from a verified session before executing owner-scoped queries. There is no cross-database foreign key from D1 to Supabase Auth.

The attachment's constant `message_role = 'user'` participates in a composite foreign key. This enforces the user-message relationship on inserts and updates. Table relationships cascade within D1 when a parent record is removed. Deleting an R2 object requires the future attachment service to coordinate object removal and retryable cleanup with the database operation.

Migration timestamps default to UTC ISO 8601 strings. Future repository updates explicitly advance `updated_at`. The unique turn ordinal determines turn order. The user message precedes the assistant within each turn.

Migration 0002 records `last_message_at` and `expires_at`. Saving a newer message sets expiration to exactly fourteen days after that message. Viewing a conversation, changing its title, and retry status changes alone do not renew it. Allocations without a message have a creation-based fallback for cleanup. The scheduled cleanup worker and image-queue consumer are subsequent application integrations. Reads must exclude expired conversations immediately, independently of the cleanup schedule.

## Failure and concurrency responsibilities

The schema rejects duplicate turn IDs, duplicate ordering, concurrent pending turns, duplicate replies, invalid parent relationships, and inconsistent failure metadata. Repository code must still enforce authenticated ownership, request payload identity on retry, state transitions, and the relationship between a completed turn and its accepted reply.

The conversation service will reserve a turn atomically, call Gemma outside a database transaction, then finalize the reply and status atomically. It must use attempt IDs and conditional writes to reject stale completions, and recover expired pending work after a process failure. The detailed lease and cancellation policy belongs in the reviewed chat use case and service design.

The image validator must inspect actual bytes before insertion. SQL metadata limits complement the existing validator. Model context continues to use bounded completed pairs and the current user message, independently of total saved history.

## API and runtime handoff

The [guide's conversation API](auth-chat-team-guide.md#5-conversation-api-owned-by-the-chat-team) specifies the intended authenticated endpoints. The implemented migration exposes data through the configured D1 binding. Hooking those endpoints into the Worker requires the shared authentication and routing foundation.

The resource name is `neocortex-chat`, with binding `DB` configured at the top level and in `env.team`. Wrangler uses a local database for local development and the account's hosted database for explicit remote commands.

The owner enabled R2 after the initial account check. Cloudflare currently provides no hard R2 spending cap. The owner requested an absolute zero-overage guarantee, so the hosted image-storage choice is pending. Attachment metadata is ready for integration with the selected private image store.

## Verification

| Case | Evidence |
|---|---|
| Migration accepted by D1 | Applied through Wrangler to local and hosted D1. |
| Owned record shape, UTC timestamp, image exchange | `backend/conversations/schema.test.ts`. |
| Duplicate turn IDs, order, pending submissions, and replies | Constraint tests in the same file. |
| Cross-conversation message/attachment references and assistant attachments | Composite foreign-key tests. |
| Image byte/dimension/pixel/type bounds, message bounds, and failed-state metadata | Constraint tests. |
| Database transaction rollback and record cascades | SQLite integration tests with foreign keys enabled. |
| Fourteen-day expiration, metadata-only changes, upgrade backfill, and queued image cleanup | Retention tests in the same file. |
| D1 configuration in the team environment | Wrangler team dry run. |
| End-to-end student access and R2 object lifecycle | Pending application integration. |

The tests use SQLite directly through Node's built-in SQLite module and run in the existing Vitest backend suite. They exercise the migration against a real SQL engine. Wrangler migration and hosted integrity checks verify D1 accepts the schema.

## Product decisions pending

Victor confirmed first-message creation, saved failed turns with Retry, saved text and images, and automatic deletion fourteen days after the last saved message. The remaining hosting decision is how to satisfy the requested zero-overage requirement for images. R2 has no provider-enforced hard spending cap.

See the broader questions about account eligibility, baseline gating, and cancellation in the [team guide](auth-chat-team-guide.md#1-agree-on-the-behavior-before-feature-implementation).

## Proposed R2 usage controls

The owner asked whether software can detect approaching the free limits. The image service should maintain a shared D1 usage ledger and reserve budget atomically before each R2 call. A local counter or a delayed dashboard measurement cannot safely coordinate concurrent requests.

Proposed conservative thresholds are 8,000,000,000 bytes of live/reserved storage, 800,000 Class A operations, and 8,000,000 Class B operations per actual R2 billing period. These are engineering proposals for review, below the published free allowances. The account owner must provide the actual billing-period boundaries and account-wide usage before initializing the ledger.

Reserve upload bytes and operation counts before calling R2. Count uncertain outcomes conservatively, including retries and failed requests. Free acknowledged storage only after an object is deleted. Refuse image operations when the ledger is unavailable, the billing period is unconfigured, or the reservation would exceed a budget. Alert before those limits and enforce verified per-user rate limits. Keep the bucket private and route image reads through the same checks.

Implement the ledger alongside the image service so every supported storage path uses it. The current foundation records attachment metadata and cleanup work. Application accounting controls the application's requests, while other tools, buckets, background operations, and provider billing behavior can affect the account total. Cloudflare has no R2 hard spending cap, so these safeguards cannot establish an absolute zero-overage guarantee. See [spending controls](https://developers.cloudflare.com/billing/manage/spend-management/) and [R2 allowances](https://developers.cloudflare.com/r2/pricing/).

## References

- [D1 foreign keys](https://developers.cloudflare.com/d1/sql-api/foreign-keys/)
- [D1 transactional batches](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
