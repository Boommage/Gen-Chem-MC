# Neocortex

Team 4's General Chemistry metacognition project. Gemma is the selected Coach model for both text and image conversations.

The combined Coach implementation is on `main` after [PR #22](https://github.com/Boommage/Gen-Chem-MC/pull/22). See the [Checkpoint 2 review](docs/checkpoint-2-review.md) for prototype scope and future use cases.

## Run the app

Run npm commands inside **`gen-chem-mc`**, where `package.json` lives:

```bash
cd gen-chem-mc
npm ci
npm run dev
```

Keep your existing `.env.local` and team token. The unified deployment upgrades the original text endpoint to accept images too:

`https://neocortex-gemma-team.neocortexmc.workers.dev`

Shared-mode teammates need only the frontend running, with no Cloudflare login. New-machine setup, local backend commands, deployment, and troubleshooting are in the [Gemma setup guide](docs/gemma-setup.md). On Windows, use `npm.cmd` / `npx.cmd` if PowerShell blocks `npm` / `npx`; Linux and macOS use `npm` / `npx`.

Project requirements and design records remain under `docs/`. Application details are in the [app README](gen-chem-mc/README.md).
