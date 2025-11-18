# PRD – "CCD/Codex Orchestrator Terminal"

## 1. Product Overview

**Working name**: CCD/Codex Orchestrator Terminal
**Base**: Fork of vercel/hyper (Hyper – Electron + React + Redux terminal)

### Vision

A Mac terminal app that behaves like Hyper but with an Orchestrator Agent that:

1. Takes a single natural language task ("set up a NestJS API for X, run tests, open logs, watch the database, etc.")
2. Decomposes it via an LLM into subtasks
3. Spawns, names, and manages multiple terminal tabs for you:
   - Tabs named like `ccd-research-user-auth`, `codex-api-implementation`, etc.
   - Each tab runs a CCD/Codex shell command suited to its task
4. Can add more tabs as needed and close tabs once done
5. The orchestrator is model-agnostic: you can plug in Claude, GPT, local LLM, etc.

## 2. Goals & Non-Goals

### Goals

- Keep the Hyper UX (tabs, themes, plugins) but add agent control
- Allow named tabs with conventions:
  - All agent tabs start with `ccd-` or `codex-`
- Single Orchestrator entry point:
  - Keyboard shortcut / button → "Give me a task"
- Orchestrator:
  - Decomposes into structured JSON of subtasks
  - Calls internal API to create/rename/close tabs and send commands to shells
- Make it easy to swap LLM backend via config

### Non-Goals (for v1)

- No multi-user collaboration or remote terminals
- No graphical workflow visualizer
- No deep integration with project management tools (Jira, Linear, etc.) yet
- No auto-commit/push to Git; just terminal-level orchestration

## 3. Target Users / Personas

### Power Builder / Indie Hacker

- Lives in terminal
- Constantly opens tons of tabs for building, running, testing and tailing logs
- Wants an LLM to "spin up the environment" instead of doing it manually

### AI Dev / Prompt Engineer

- Uses CCD/Codex commands as "agent shells"
- Wants a clean, repeatable way to spin up task-specific agents in separate tabs

## 4. Key User Stories

### US-1 – Fire-and-forget task

As a dev, I type a high-level task into Orchestrator. It spawns multiple tabs with names like `ccd-research-auth`, `codex-api-scaffold`, runs the commands, and I can watch each one.

### US-2 – Auto-closing completed tabs

As a dev, I want agent tabs to auto-close when their job is clearly done (command finishes successfully), so my workspace stays clean.

### US-3 – Manual control

I can:
- Right-click → "Kill agent" on a tab
- Or ask the Orchestrator "kill all research tabs", and it kills all tabs whose names start with `ccd-` and contain `research`

### US-4 – Model-agnostic orchestrator

In settings, I choose "Claude", "GPT-4.1", "local LLM URL", etc. The orchestrator uses a fixed JSON schema, independent of provider.

### US-5 – One-click re-run

I can re-trigger the same orchestrator plan (e.g. on a new project) and it re-creates the same set of agents/tabs and commands.

## 5. UX / UI Requirements

### R1 – Orchestrator Entry

- Add a button in the Hyper header bar: "Orchestrate"
- Add a keybinding (default: Cmd+Shift+O)
- Pressing either opens a modal:
  ```
  "Describe what you want done: [ textarea ]
  [Dropdown: Preferred agent type per task: CCD / Codex / Auto]
  [Run] [Cancel]"
  ```

### R2 – Agent Tab Naming

- Enforce prefix rules:
  - `ccd-<short-slug>` for CCD tasks
  - `codex-<short-slug>` for Codex tasks
- Show tab title as `<prefix>-<short-slug>` and use a different tab text colour for agent tabs (via decorateTabs)

### R3 – Orchestrator Status

Optional small side panel or tooltip in header:
- "Last orchestration: succeeded / failed"
- Number of active agent tabs

### R4 – Manual Actions

- Right-click menu on a tab:
  - "Kill agent (Orchestrator-aware)" – sends a signal to Orchestrator & closes the tab
- Or a command palette entry: "Orchestrator: Kill all CCD tabs", "Kill all agent tabs"

## 6. Functional Requirements

### F1 – Task ingestion

Orchestrator receives:
```json
{
  "task": "<user natural language>",
  "preferences": {
    "default_agent_type": "ccd|codex|auto"
  }
}
```

### F2 – Decomposition (LLM side)

LLM returns:
```json
{
  "agents": [
    {
      "id": "ccd-research-auth",
      "type": "ccd",
      "description": "Research best practices for authentication",
      "command": "ccd \"Research authentication best practices for NestJS and write summary\""
    },
    {
      "id": "codex-implement-auth",
      "type": "codex",
      "description": "Implement auth endpoints in NestJS",
      "command": "codex \"Add JWT-based auth to current NestJS project\""
    }
  ]
}
```

### F3 – Tab creation & command execution

For each agent:
1. Create a new tab
2. Set the tab title to its `id`
3. Send the `command` into that tab's shell (as if typed and hitting Enter)

This uses Hyper's extension system: middleware to intercept actions and custom actions to spawn sessions & set titles.

### F4 – Tab lifecycle

Orchestrator keeps a map:
```javascript
agentId → { hyperTabUid, sessionId, type }
```

Should be able to:
- Close a specific agent tab
- Close all agent tabs of a type

Optional v1: watch session output for "DONE"/exit code 0 and auto-close.

### F5 – Config & Secrets

`.hyper.js` (or app config) supports:
```javascript
orchestrator: {
  provider: 'openai' | 'anthropic' | 'custom',
  apiKeyEnv: 'OPENAI_API_KEY',
  defaultModel: 'gpt-4.1-mini',
  baseUrl: 'https://api.openai.com/v1' // or your own proxy
}
```

### F6 – Offline fallback

If LLM call fails:
- Show error toast
- Do not create or modify tabs

## 7. Non-Functional Requirements

### Performance

- Orchestrator call might take a few seconds; UI must remain responsive (async)

### Security

- API keys never logged
- Keys stored via environment or local encrypted storage (later)

### Portability

- v1: target macOS only
- Keep code cross-platform where possible

## 8. Tech Stack & Architecture

### Base App

- Hyper (Electron, React, Redux, xterm.js)

### New Components

#### hyper-ccd-orchestrator plugin (renderer)

- Uses Hyper extension API: `decorateHeader`, `middleware`, `reduceUI`, etc.
- Renders Orchestrator button + modal
- Dispatches custom Redux actions like `ORCH_RUN_TASK`, `ORCH_SPAWN_AGENT_TAB`, `ORCH_KILL_AGENT_TAB`

#### Orchestrator Service (Electron / Node side)

- Listens for IPC/RPC from renderer
- Calls configured LLM provider
- Sends back agent plan

#### Session/Tab Manager (plugin side)

Uses Hyper Redux store and actions to:
- Create new sessions/tabs
- Set tab titles
- Send data to sessions (commands)

## 9. Milestones

### M0 – Fork & compile Hyper

✅ Fork Hyper repository

### M1 – Add simple "Spawn CCD tab" button (no LLM)

✅ Prompts for text, creates tab titled `ccd-temp`, runs `ccd "text"`

### M2 – Plug in Orchestrator LLM

⬜ Use fixed JSON schema, spawn multiple tabs accordingly

### M3 – Agent management

⬜ Track, close by id, kill all

### M4 – Polish UI & packaging

⬜ Custom icon, Mac .app build, docs

## 10. Current Implementation Status

### Completed (M1)

- ✅ Plugin directory structure
- ✅ Orchestrator button in Hyper header
- ✅ Task input modal
- ✅ Basic tab creation with agent naming
- ✅ Stub LLM decomposition (returns 2 hardcoded agents)
- ✅ Command execution in spawned tabs

### Next Steps (M2)

- ⬜ Replace `orchestratorClient.js` stub with real LLM API call
- ⬜ Implement proper prompt template for decomposition
- ⬜ Add error handling for LLM failures
- ⬜ Add loading state during LLM call

### Future (M3+)

- ⬜ Agent tracking and lifecycle management
- ⬜ Tab cleanup functionality
- ⬜ Keyboard shortcuts
- ⬜ Configuration system
- ⬜ Auto-close on completion
- ⬜ Context menu integration

## 11. API Schema

### Agent Plan Schema

```typescript
interface AgentPlan {
  agents: Agent[];
}

interface Agent {
  id: string;           // e.g. "ccd-research-auth"
  type: 'ccd' | 'codex';
  description: string;  // Human-readable description
  command: string;      // Shell command to execute
}
```

### Configuration Schema

```typescript
interface OrchestratorConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKeyEnv: string;
  defaultModel: string;
  baseUrl?: string;
}
```

## 12. Success Metrics

- **Developer Productivity**: Reduce time to set up multi-tab dev environments from minutes to seconds
- **Adoption**: Developers use orchestrator for 50%+ of their multi-tab workflows
- **Reliability**: 95%+ of orchestrator requests successfully create working agent tabs
- **Extensibility**: Easy to add new LLM providers (< 1 hour integration time)
