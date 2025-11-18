# hyper-ccd-orchestrator

A Hyper terminal plugin that enables orchestration of CCD/Codex agent tabs through natural language task descriptions.

## Overview

This plugin adds an "Orchestrator" feature to Hyper that allows you to:
- Describe a high-level task in natural language
- Automatically spawn multiple terminal tabs with CCD/Codex agents
- Each agent tab is named and receives a specific command to execute
- Tabs follow naming conventions: `ccd-<task-slug>` or `codex-<task-slug>`

## Features

- **Orchestrator Button**: Click the "Orchestrate" button in the Hyper header to open the task input modal
- **Natural Language Tasks**: Describe what you want done in plain English
- **Automatic Tab Creation**: Spawns multiple tabs based on task decomposition
- **Agent Naming**: All agent tabs follow the naming convention `ccd-*` or `codex-*`
- **Model-Agnostic**: Designed to work with any LLM backend (OpenAI, Claude, local models, etc.)

## Installation

### Development/Local Installation

1. Clone this repository or copy the plugin to your Hyper plugins directory:
   ```bash
   cd ~/.hyper_plugins/local
   # or for development in the Hyper repo:
   cd /path/to/hyper/plugins/local
   ```

2. Add the plugin to your `.hyper.js` config file:
   ```javascript
   module.exports = {
     config: {
       // ... your config
     },
     plugins: [],
     localPlugins: ['hyper-ccd-orchestrator'],
   };
   ```

3. Restart Hyper or reload the window

## Usage

1. Click the "Orchestrate" button in the Hyper header (or use the keyboard shortcut if configured)
2. Enter your task description in the modal that appears
3. Click "Run"
4. The orchestrator will create multiple tabs, each running a CCD or Codex command

### Example Task

```
Set up this NestJS project: run the dev server, watch tests, and tail the logs
```

This will create tabs like:
- `ccd-research-nestjs-setup` - Research task
- `codex-impl-nestjs-setup` - Implementation task

## Architecture

### File Structure

```
hyper-ccd-orchestrator/
├── package.json          # Plugin metadata
├── index.js             # Main plugin logic (decorators, middleware)
├── orchestratorClient.js # LLM integration (stub, replace with real API)
└── ui/
    ├── OrchestratorButton.js  # Header button component
    └── OrchestratorModal.js   # Task input modal component
```

### How It Works

1. **UI Layer**: The plugin adds a button to the Hyper header and a modal for task input
2. **Orchestrator**: When you submit a task, it calls the `getAgentPlan()` function
3. **Decomposition**: The orchestrator (currently a stub) returns a JSON plan with agents
4. **Tab Creation**: For each agent in the plan, the plugin:
   - Creates a new terminal tab
   - Sets the tab title to the agent ID
   - Sends the agent's command to the shell

## Configuration (Future)

In the future, you'll be able to configure the orchestrator in your `.hyper.js`:

```javascript
module.exports = {
  config: {
    // ... other config
    orchestrator: {
      provider: 'openai',  // or 'anthropic', 'custom'
      apiKeyEnv: 'OPENAI_API_KEY',
      model: 'gpt-4.1-mini',
      endpoint: 'https://api.openai.com/v1/chat/completions'
    }
  }
};
```

## Current Status

**v0.1.0 - M1: Basic Tab Creation**

- ✅ Orchestrator button in header
- ✅ Task input modal
- ✅ Stub decomposition (creates 2 agent tabs per task)
- ✅ Tab creation and naming
- ⚠️  LLM integration is stubbed (returns hardcoded plan)

## Next Steps

### M2: Real LLM Integration

Replace the stub in `orchestratorClient.js` with actual LLM API calls:

```javascript
async function getAgentPlan(task, preferences = {}) {
  // Call your LLM API here
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an orchestrator that decomposes tasks into agent plans...'
        },
        {
          role: 'user',
          content: task
        }
      ]
    })
  });

  // Parse response and return agent plan
  return { agents: [...] };
}
```

### M3: Agent Management

- Track active agent tabs
- Add context menu items to kill agent tabs
- Auto-close tabs when jobs complete

### M4: Polish

- Keyboard shortcuts (Cmd+Shift+O)
- Better error handling
- Configuration support
- Status indicators

## Contributing

Contributions welcome! This is an early-stage plugin designed to be extended.

## License

MIT
