# Gen Chem-ers — Local AI Tutor Setup

This guide explains how to run our custom Gen Chem AI tutor locally using Ollama and Qwen2.5 3B.

Our AI tutor is designed to help students understand General Chemistry concepts by asking guiding questions instead of immediately providing answers.

## 1. Prerequisites

Before getting started, make sure you have:

- Git
- Node.js (version 18 or newer)
- npm
- Ollama installed on your computer
- The Gen-Chem-MC project downloaded or cloned from GitHub

Download Ollama: https://ollama.com/download

## 2. Download the AI Model

Open a terminal and run:

```bash
ollama pull qwen2.5:3b
```

This downloads the base Qwen model. You only need to do this once per computer.

Check that it is installed:

```bash
ollama list
```

## 3. Create Our Custom Gen Chem Tutor

From the outer `Gen-Chem-MC` repository directory, run:

```bash
ollama create genchem-tutor -f gen-chem-mc/backend/Modelfile
```

This creates our customized AI tutor using the instructions in `Modelfile`.

The custom model includes rules for:

- Asking one guiding question at a time
- Helping students understand chemistry concepts
- Giving hints instead of immediately revealing answers
- Supporting study planning and reflection
- Using friendly, student-focused explanations

You only need to recreate the model when setting up a new computer or after updating the Modelfile.

## 4. Test the Tutor

Run:

```bash
ollama run genchem-tutor
```

Try asking:

"I have 2 moles of NaCl in 4 liters of solution. Help me calculate molarity step by step."

The tutor should guide you through the problem instead of immediately giving the final answer.

To exit the chat, type:

```text
/bye
```

## 5. Install Project Dependencies

From the outer `Gen-Chem-MC` directory:

```bash
cd gen-chem-mc
npm install
```

If dependencies are already installed, you can skip this step.

Return to the outer directory:

```bash
cd ..
```

## 6. Configure the Local AI Backend

Inside the inner `gen-chem-mc` directory, create a file named `.env.local`.

Add:

```dotenv
VITE_AI_API_URL=http://localhost:8788
```

This tells the React Coach page to use the local Qwen tutor.

The `.env.local` file is ignored by Git and must be created separately on each teammate's computer.

If this variable is not set, the Coach page uses the existing GLM backend at `http://localhost:8787`.

## 7. Start the Local AI Backend

From the outer `Gen-Chem-MC` directory, run:

```bash
node gen-chem-mc/backend/ollama-server.mjs
```

Expected output:

```text
Gen Chem tutor API running at http://localhost:8788
```

Keep this terminal open while using the app.

Ollama must also be running in the background. On macOS, open the Ollama application if it is not already running.

## 8. Start the React Application

Open a second terminal.

From the outer `Gen-Chem-MC` directory, run:

```bash
cd gen-chem-mc
npm run dev
```

Open the URL displayed by Vite, usually:

http://localhost:5173

Navigate to the **Coach** page and start chatting with the tutor.

## 9. Quick Start (After Initial Setup)

Once Ollama, the custom model, dependencies, and `.env.local` are configured, you only need these steps each time:

**Terminal 1 — AI Backend**

From the outer repository directory:

```bash
node gen-chem-mc/backend/ollama-server.mjs
```

**Terminal 2 — React Frontend**

From the outer repository directory:

```bash
cd gen-chem-mc
npm run dev
```

Then open the Coach page in your browser.

Make sure Ollama is running before sending messages.

## 10. Switching Between Qwen and GLM

Our project supports two separate AI backends.

| Model | Backend | Port |
|---|---|---|
| Qwen2.5 3B (local) | `backend/ollama-server.mjs` | 8788 |
| GLM-4.7-Flash (Cloudflare) | `backend/model.ts` | 8787 |

To use Qwen, set the following in `.env.local`:

```dotenv
VITE_AI_API_URL=http://localhost:8788
```

To use GLM locally, set:

```dotenv
VITE_AI_API_URL=http://localhost:8787
```

The GLM backend must be running separately and may require Cloudflare configuration.

Restart the Vite development server after changing `.env.local`.

## 11. Troubleshooting

**Problem: `ollama: command not found`**

Install Ollama and restart your terminal.

**Problem: `model 'genchem-tutor' not found`**

Recreate the custom model:

```bash
ollama create genchem-tutor -f gen-chem-mc/backend/Modelfile
```

**Problem: Cannot connect to Ollama**

Make sure the Ollama application is running.

Test its connection:

```bash
curl http://localhost:11434/api/tags
```

**Problem: Port 8788 is already in use**

You may already have the local backend running. Check your existing terminals before starting another server.

**Problem: The Coach page doesn't respond**

Check that:

1. Ollama is running.
2. The local API is running on port 8788.
3. `.env.local` contains the correct backend URL.
4. The React frontend is running.
5. The browser console and backend terminal do not show errors.

## Notes for Teammates

- The Qwen model runs locally on each developer's computer.
- Ollama models are not automatically downloaded when cloning the GitHub repository.
- The `Modelfile` contains our shared tutor instructions.
- Do not commit `.env.local` or personal credentials.
- The Qwen backend does not replace the existing GLM backend.
- Local testing does not mean the AI model is hosted online for other users.

**Current setup:** Qwen2.5 3B + Ollama + Node.js local API + React/Vite.
