# Neocortex database setup

The chat database is Cloudflare D1 `neocortex-chat`. Its `DB` binding is configured for local development and the `team` Worker environment. Supabase Auth supplies student identity. Saved text and images expire fourteen days after the last saved message. On November 27 the owner approved private R2 storage with application usage limits and accepted that charges cannot be guaranteed zero.

The first migration creates conversation records. The second adds expiration and image cleanup. The third adds retry fingerprints, R2 usage/object reservations, and per-student daily counters. See the [chat design](design/chat.md) and [team implementation guide](design/auth-chat-team-guide.md).

## Every developer

From the repository root, enter the app directory and install the lockfile dependencies.

~~~bash
cd gen-chem-mc
npm ci
npx wrangler d1 migrations apply DB --local
~~~

Each worktree has its own local database under its ignored `.wrangler/` directory. The local command applies pending migrations to that local copy. The migration ledger prevents a second application of the same migration.

Check local connectivity and schema without displaying message content.

~~~bash
npx wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;"
npm test -- backend/conversations
npm test -- src/features/chat
~~~

On Windows, use `npm.cmd` and `npx.cmd` when PowerShell requires them. Linux/macOS use `npm` and `npx`.

## Shared database owner

Victor coordinates changes to the shared database and bindings. The hosted database was created and its initial migration applied on November 20, 2026.

After reviewing a future migration, apply it explicitly to the shared environment.

~~~bash
npx wrangler d1 migrations list DB --env team --remote
npx wrangler d1 migrations apply DB --env team --remote
~~~

These remote commands require Cloudflare access to the team's account. Teammates using the shared Worker develop through the application's API. Schema changes go in sequential migration files, with tests for the invariants they introduce.

The binding configuration reaches a deployed Worker after a deployment containing the updated Wrangler configuration. Test the integrated authenticated API before connecting the student UI to persisted records.

## Private images: endpoint owner setup

R2 is enabled on the account, but this feature does not create a remote bucket or upload production objects. The configuration reserves the binding name `CHAT_IMAGES` and bucket name `neocortex-chat-images`. Live image operations are explicitly disabled until setup is complete. Cloudflare has no R2 hard spending cap; the owner accepted this limitation. Application quotas reduce risk but cannot guarantee a zero invoice.

After the feature and real authentication integration are reviewed, the endpoint owner:

1. Creates a **fresh, dedicated** bucket: `npx wrangler r2 bucket create neocortex-chat-images`. Keep all public bucket access disabled. The image helper explicitly writes Standard objects.
2. Applies the reviewed D1 migrations using the shared-database commands above. Migration 0003 initializes conservative counters at zero, so an existing bucket or outside R2 usage requires reconciliation before enabling it.
3. Sets `CHAT_IMAGE_STORAGE_ENABLED` to `"true"` in the intended Wrangler environment, regenerates `npm run types:worker`, and reviews that configuration change. Never enable it globally just to bypass a missing binding or ledger.
4. Connects the real login verifier and conversation handler as described in the team guide, then deploys the reviewed integration with `npm run deploy:team`. This remains the existing `neocortex-gemma-team` endpoint; teammates keep their current proxy URL/token.
5. Tests text, a small image, reopen, follow-up, two real accounts, ownership refusal, and cron cleanup. Teammates using the shared endpoint only run the frontend; local Worker development still requires its own backend terminal.

Hourly cron configuration runs bounded conversation/image cleanup. Access is refused at the exact expiration time even if physical cleanup is delayed. Failed deletes remain queued. New chat and title/view activity alone do not renew retention.

The application caps cumulative upload/reservation bytes at 8 GB, Class A calls at 800,000, and Class B calls at 8,000,000, with per-student daily limits of 50 uploads and 500 reads. Counters never reset automatically and never refund uncertain uploads or deletions. This is deliberately stricter than monthly metering. Exhaustion stops image operations while text chat remains available.

Inspect counters without displaying private content:

~~~bash
npx wrangler d1 execute DB --env team --remote --command "SELECT upload_bytes, class_a, class_b, ROUND(upload_bytes * 100.0 / 8000000000, 2) AS storage_budget_percent, ROUND(class_a * 100.0 / 800000, 2) AS class_a_budget_percent, ROUND(class_b * 100.0 / 8000000, 2) AS class_b_budget_percent FROM r2_usage;"
~~~

Only reconcile/reset counters after reviewing provider totals, retained objects, and in-flight requests. Dashboard uploads, other applications, and changes to provider billing can affect the account separately. The [R2 pricing reference](https://developers.cloudflare.com/r2/pricing/) documents the current monthly allowances; the [chat design](design/chat.md) explains these stricter application controls.

Configure the Supabase Auth project with the login team. Follow AGENTS.md for entering public configuration and secrets. Existing account credentials stay in their managed services.

A database record deletion cascades to its child records and queues image removal. `backend/conversations/cleanup.ts` processes that queue; reserved uploads with uncertain outcomes remain accounted and are repeatedly cleaned up. The current tests use fabricated identities, SQLite, and fake R2 transports. They do not replace real Supabase verification or a deployed storage smoke test.
