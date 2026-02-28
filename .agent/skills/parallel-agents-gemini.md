---
name: parallel-agents-gemini
description: "Use when you want to execute a large markdown implementation plan autonomously in the background using your Gemini API key, while freeing up your main session."
---

# Parallel Agents (Powered by Gemini + Aider)

## Overview

You can now spawn independent, autonomous agents in your terminal that execute your markdown implementation plans using **Gemini**. This frees up our current chat so we can continue brainstorming or writing code while the "junior developer" agent handles the grunt work in the background.

We use **Aider** as the orchestrator for this. Aider reads `.md` files, connects directly to Google's GenAI API, and methodically executes the code, running tests and committing along the way—identically to how Claude Code works!

## 🚀 One-Time Setup

If you haven't installed the agent yet, just run our setup script from the root of your project:

```bash
npm run agent:setup
```

This will safely install `aider` and ensure it's available in your terminal path.

## 🔑 Booting Up Your Parallel Agent

When we finish creating an implementation plan (e.g., `docs/plans/2026-03-01-feature-design.md`), you can send the background agent off to work!

### Step 1: Export your Key
Grab your key from Google AI Studio and run this in a second terminal window:
```bash
export GEMINI_API_KEY="your_actual_api_key_here"
```

### Step 2: Dispatch the Agent
Tell the agent to read the plan and start executing:

```bash
aider --model gemini/gemini-1.5-pro-latest --message-file docs/plans/your-plan.md
```

Alternatively, if you just want to drop into an interactive terminal chat with Gemini about your codebase without specifying a `.md` file, simply run:

```bash
npm run agent
```

## 🧠 Why this is powerful

- **Context Window**: Gemini 1.5 Pro has a 2-million token context window. It can hold this *entire* repository in its memory at once while orchestrating.
- **Async Workflow**: While the agent writes code for 10 minutes in your second terminal tab, you and I can continue discussing our next feature together here.
- **Cost**: Your Gemini API limits (if using API) are generally separate from frontend subscription chats, allowing massive throughput.
