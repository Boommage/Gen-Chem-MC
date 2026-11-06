# Gemma image setup

Image and text coaching are now combined on **`codex/gemma-unified-integration`**. Use the [current Gemma setup guide](gemma-setup.md) for both.

The canonical backend remains the original text endpoint:

**`https://neocortex-gemma-team.neocortexmc.workers.dev`**

Existing text-mode `.env.local` settings and the team token stay the same. The endpoint owner upgrades that Worker with `npm run deploy:team`; teammates pull this branch, run `npm ci`, and start only `npm run dev` in shared mode.

The older separate image Worker is not deleted and can continue serving existing test users. It is no longer required for images on the unified branch, and this branch does not rewrite any local configuration file or deploy through the old `images` environment. For intentional local mode, run `npm run dev:api` and `npm run dev` in separate terminals with the local URL described in the current guide.
