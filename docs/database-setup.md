# Neocortex database setup

The chat database is Cloudflare D1 `neocortex-chat`. Its `DB` binding is configured for local development and the `team` Worker environment. Supabase Auth supplies student identity. The owner confirmed saved text and images, with automatic 14-day retention. Expiration is fourteen days after the last saved message. The hosted image-storage billing choice is pending.

The first migration creates `conversations`, `turns`, `messages`, and `attachments`. The second adds expiration tracking and a durable `image_deletions` queue. See the [database design](design/chat.md) and [team implementation guide](design/auth-chat-team-guide.md).

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
npm test -- backend/conversations/schema.test.ts
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

## Images and account setup

The owner enabled R2. Its usage above the free allowances is billable, and Cloudflare currently offers no hard spending cap for R2. The owner requested guaranteed zero overage, so the hosted image-storage choice is pending. Application quotas and billing alerts reduce risk but cannot guarantee a zero invoice. See [Cloudflare spending controls](https://developers.cloudflare.com/billing/manage/spend-management/).

Configure the Supabase Auth project with the login team. Follow AGENTS.md for entering public configuration and secrets. Existing account credentials stay in their managed services.

A database record deletion cascades to its child records. File deletion needs the attachment service's cleanup operation as well. The database calculates expiration fourteen days after the last saved message. A scheduled cleanup worker and an image-queue consumer are the next retention integration steps.
