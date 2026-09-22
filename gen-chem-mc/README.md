# Neocortex

Neocortex is Team 4's senior design project: a metacognition and student-success platform for General Chemistry students.

This repository currently contains the initial frontend shell and four prototype pages:

- Dashboard
- Study
- Coach
- Progress

The current milestone is frontend-only. Authentication, databases, analytics, and AI-model integration are not implemented yet.

## Technology

- React 19
- TypeScript
- Vite 8
- npm

## Repository layout

The Git repository contains project documentation and the frontend application:

```text
Gen-Chem-MC/
├── docs/                 Project documentation
└── gen-chem-mc/          React frontend (run npm commands here)
    ├── public/
    ├── src/
    │   ├── components/   Shared layout and UI components
    │   ├── pages/        Dashboard, Study, Coach, and Progress
    │   ├── App.tsx       Client-side route selection
    │   ├── App.css       Application styling
    │   └── main.tsx      React entry point
    ├── package.json
    └── package-lock.json
```

All commands in the rest of this guide should be run from `Gen-Chem-MC/gen-chem-mc` unless noted otherwise.

## Prerequisites

You need:

- Git
- Node.js 20.19 or newer (Node.js 22 LTS is recommended)
- npm, which is included with Node.js

Check whether they are already installed:

```bash
git --version
node --version
npm --version
```

If all three commands print version numbers and Node.js is at least `20.19`, continue to [Get the project](#get-the-project).

## Installing Node.js and npm

Installing Node.js also installs npm. Do not download npm separately.

### Windows

#### Option 1: Official installer

1. Go to [nodejs.org](https://nodejs.org/).
2. Download the current LTS installer.
3. Run the installer and keep the default options, including the option to add Node.js to `PATH`.
4. Close and reopen PowerShell, Command Prompt, or your editor.
5. Verify the installation:

   ```powershell
   node --version
   npm --version
   ```

#### Option 2: Windows Package Manager

Open PowerShell and run:

```powershell
winget install OpenJS.NodeJS.LTS
```

Close and reopen the terminal, then verify:

```powershell
node --version
npm --version
```

### macOS

#### Option 1: Official installer

1. Go to [nodejs.org](https://nodejs.org/).
2. Download and run the macOS LTS installer.
3. Open a new Terminal window and verify:

   ```bash
   node --version
   npm --version
   ```

#### Option 2: Homebrew

If you use [Homebrew](https://brew.sh/):

```bash
brew install node@22
```

Follow any PATH instructions printed by Homebrew, open a new terminal, and verify the installation.

### Linux or WSL

Using a version manager avoids outdated Node.js packages from some Linux distributions. The following installs `nvm` and Node.js 22:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Close and reopen the terminal, or load `nvm` into the current shell as directed by the installer. Then run:

```bash
nvm install 22
nvm use 22
node --version
npm --version
```

If `nvm` is still not found after installation, restart the terminal before trying again.

## Installing Git

If `git --version` is not recognized:

- Windows: install [Git for Windows](https://git-scm.com/download/win).
- macOS: run `xcode-select --install`, or install Git with Homebrew.
- Linux/WSL: install Git with your distribution's package manager, such as `sudo apt install git` on Ubuntu.

Open a new terminal and confirm that `git --version` works.

## Get the project

Clone the repository and enter the frontend directory:

```bash
git clone https://github.com/Boommage/Gen-Chem-MC.git
cd Gen-Chem-MC/gen-chem-mc
```

If you already cloned it, update your local default branch before starting new work:

```bash
cd Gen-Chem-MC
git switch main
git pull origin main
cd gen-chem-mc
```

If the repository's default branch is not named `main`, substitute its actual name in the commands above.

## Install dependencies

From the `gen-chem-mc` frontend directory, run:

```bash
npm install
```

This reads `package.json` and `package-lock.json` and creates a local `node_modules` directory. Do not commit `node_modules`.

For a clean, reproducible installation that exactly follows the lockfile, use:

```bash
npm ci
```

Use `npm install` for ordinary initial setup and when intentionally changing dependencies. Use `npm ci` for clean verification or automated builds. This project uses npm; do not create or commit `pnpm-lock.yaml` or `yarn.lock` files.

## Start the development server

```bash
npm run dev
```

Vite will print a local address, normally [http://localhost:5173](http://localhost:5173). Open it in a browser. Changes to source files should update automatically.

Stop the server with `Ctrl+C`.

## Available pages

The frontend provides these routes:

| Page | Route |
| --- | --- |
| Dashboard | `/dashboard` |
| Study | `/study` |
| Coach | `/coach` |
| Progress | `/progress` |

Unknown routes currently redirect to `/dashboard`.

## Create a branch and contribute

Do not develop directly on the shared default branch. Start from an up-to-date copy, then create a focused branch:

```bash
cd Gen-Chem-MC
git switch main
git pull origin main
git switch -c feature/short-description
```

Examples:

```bash
git switch -c feature/study-session-form
git switch -c fix/coach-mobile-spacing
git switch -c docs/update-setup-guide
```

Make your changes, then review what changed:

```bash
git status
git diff
```

Before committing, run the project checks from `Gen-Chem-MC/gen-chem-mc`:

```bash
npm run lint
npm run build
```

Commit and push the branch:

```bash
git add <files-you-changed>
git commit -m "Brief description of the change"
git push -u origin feature/short-description
```

Then open a pull request on GitHub and request review from the team. Keep each branch and pull request focused on one feature, fix, or documentation change.

Before continuing work on an existing branch, incorporate the latest shared changes according to the team's agreed Git workflow. If the team has not chosen between merging and rebasing, ask before rewriting branch history.

## Project scripts

Run these from `Gen-Chem-MC/gen-chem-mc`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server with hot reload |
| `npm run build` | Run TypeScript checks and create a production build in `dist/` |
| `npm run lint` | Check source files with Oxlint |
| `npm run preview` | Serve the completed production build locally |

## Development guidelines

- Inspect existing components and conventions before adding new files.
- Reuse the shared application shell rather than duplicating sidebar or header markup.
- Keep page-specific code in `src/pages` and reusable UI in `src/components`.
- Preserve the existing visual language: warm off-white backgrounds, dark green accents, spacious layouts, and restrained UI.
- Keep changes within the approved project scope.
- Do not add dependencies unless they are necessary and agreed upon.
- Do not commit generated folders such as `node_modules` or `dist`.
- Run lint and build checks before opening a pull request.

## Troubleshooting

### `npm` or `node` is not recognized

Install Node.js using the instructions above, then completely close and reopen the terminal or editor. The installer must add Node.js to your `PATH`.

### The Node.js version is too old

Check your version:

```bash
node --version
```

Upgrade to Node.js 22 LTS. Vite 8 requires Node.js 20.19+ or 22.12+.

If you use `nvm`:

```bash
nvm install 22
nvm use 22
```

### Dependencies appear broken

First try a clean lockfile-based installation:

```bash
npm ci
```

If the problem remains, confirm that you are in the `gen-chem-mc` directory and are using a supported Node.js version before asking the team for help. Include the full error message, operating system, `node --version`, and `npm --version`.

### Port 5173 is already in use

Vite will normally choose another available port and print the new address. Use the exact address shown in the terminal.

### Direct page links fail after deployment

The local Vite development server supports the application routes. A production host must be configured to serve `index.html` as the fallback for `/dashboard`, `/study`, `/coach`, and `/progress`.

## Current scope and limitations

- Coach messages exist only in browser memory and disappear after a refresh.
- The Coach page does not call an AI model.
- Authentication and persistent profiles are not implemented.
- Study tools and analytics are not implemented.
- Dashboard content is currently static.

These limitations are intentional for the current frontend milestone.
