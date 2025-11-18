# hyper-ccd-orchestrator

A Hyper terminal plugin that enables orchestration of CCD/Codex agent tabs through natural language task descriptions.

## Overview

This plugin adds an "Orchestrator" feature to Hyper that allows you to:
- Describe a high-level task in natural language
- Automatically spawn multiple terminal tabs with CCD/Codex agents using LLM-powered task decomposition
- Each agent tab is named and receives a specific command to execute
- Tabs follow naming conventions: `ccd-<task-slug>` or `codex-<task-slug>`
- Choose from multiple LLM providers (OpenRouter, DeepSeek, GLM-4, OpenAI, Anthropic, or custom)

## Features

- **Orchestrator Button**: Click the "Orchestrate" button in the Hyper header to open the task input modal
- **Natural Language Tasks**: Describe what you want done in plain English
- **Automatic Tab Creation**: Spawns multiple tabs based on LLM-powered task decomposition
- **Agent Naming**: All agent tabs follow the naming convention `ccd-*` or `codex-*`
- **Multi-Provider Support**: Works with OpenRouter, DeepSeek, GLM-4, OpenAI, Anthropic, or any OpenAI-compatible API
- **Local Configuration**: Settings and API keys stored securely in browser localStorage
- **Error Handling**: Graceful fallback to stub mode if LLM fails
- **Loading States**: Visual feedback during LLM processing

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

### First Time Setup

1. Click the "Orchestrate" button in the Hyper header
2. Click "▶ Show Settings" to expand the configuration panel
3. Select your preferred LLM provider from the dropdown:
   - **OpenRouter**: Access to many models (Claude, GPT, etc.)
   - **DeepSeek**: DeepSeek's chat models
   - **GLM-4**: Zhipu AI's GLM-4 models
   - **OpenAI**: OpenAI's GPT models
   - **Anthropic**: Claude models directly
   - **Custom**: Any OpenAI-compatible endpoint
4. Enter your API key for the selected provider
5. (Optional) Override the default model
6. Settings are automatically saved in browser storage

### Running Tasks

1. Click the "Orchestrate" button
2. Enter your task description in plain English
3. Click "Run Orchestrator"
4. Wait for the LLM to decompose your task (loading indicator will show)
5. The plugin will automatically create tabs for each agent and run commands

### Example Tasks

**Simple development environment:**
```
Set up this NestJS project: run the dev server, watch tests, and tail the logs
```

**Complex multi-step task:**
```
Set up a NestJS API with PostgreSQL and JWT authentication
```

This might create tabs like:
- `ccd-research-nestjs-auth` - Research authentication best practices
- `codex-setup-project` - Initialize NestJS project with dependencies
- `codex-database-setup` - Configure PostgreSQL and TypeORM
- `codex-auth-implementation` - Implement JWT authentication
- `ccd-test-and-verify` - Test the authentication flow

## Supported LLM Providers

### OpenRouter
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Default Model**: `anthropic/claude-3.5-sonnet`
- **Get API Key**: https://openrouter.ai/keys
- **Features**: Access to multiple models (Claude, GPT, etc.) through one API

### DeepSeek
- **Endpoint**: `https://api.deepseek.com/v1/chat/completions`
- **Default Model**: `deepseek-chat`
- **Get API Key**: https://platform.deepseek.com/api_keys
- **Features**: Cost-effective, powerful reasoning models

### GLM-4
- **Endpoint**: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- **Default Model**: `glm-4-plus`
- **Get API Key**: https://open.bigmodel.cn/usercenter/apikeys
- **Features**: Zhipu AI's advanced language model

### OpenAI
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Default Model**: `gpt-4o-mini`
- **Get API Key**: https://platform.openai.com/api-keys
- **Features**: Latest GPT models

### Anthropic
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Default Model**: `claude-3-5-sonnet-20241022`
- **Get API Key**: https://console.anthropic.com/settings/keys
- **Features**: Direct Claude API access

### Custom Provider
- **Endpoint**: Your custom URL
- **Model**: Specify your model name
- **Features**: Use any OpenAI-compatible endpoint

## Architecture

### File Structure

```
hyper-ccd-orchestrator/
├── package.json              # Plugin metadata
├── index.js                  # Main plugin logic (decorators, middleware)
├── orchestratorClient.js     # LLM integration with multi-provider support
├── PRD.md                    # Product requirements document
├── README.md                 # This file
└── ui/
    ├── OrchestratorButton.js  # Header button component
    └── OrchestratorModal.js   # Task input modal with settings
```

### How It Works

1. **UI Layer**: The plugin adds a button to the Hyper header and a modal for task input and configuration
2. **Orchestrator**: When you submit a task, it calls the `getAgentPlan()` function with your configuration
3. **LLM Decomposition**: The orchestrator sends your task to the selected LLM provider with a system prompt
4. **Agent Plan Parsing**: The LLM returns a JSON plan with specific agents and commands
5. **Tab Creation**: For each agent in the plan, the plugin:
   - Creates a new terminal tab (Hyper term group)
   - Sets the tab title to the agent ID
   - Sends the agent's command to the shell

### System Prompt

The orchestrator uses a carefully crafted system prompt that instructs the LLM to:
- Break down high-level tasks into specific subtasks
- Assign appropriate agent types (CCD for research, Codex for implementation)
- Generate actionable commands for each agent
- Return a structured JSON response

## Configuration

Settings are stored in browser `localStorage` under the key `hyper-ccd-orchestrator-config`. This includes:

```json
{
  "provider": "openrouter",
  "apiKey": "your-api-key",
  "model": "",
  "customEndpoint": ""
}
```

**Security Note**: Your API key is stored locally in the browser and is only sent to your selected LLM provider. It is never sent elsewhere.

## Error Handling

The plugin includes robust error handling:

- **No API Key**: Falls back to stub mode (creates 2 basic agents)
- **LLM API Failure**: Shows error message and optionally falls back to stub mode
- **Invalid JSON**: Attempts to parse and auto-fix agent plans
- **Network Issues**: Displays clear error messages in the modal

## Current Status

**v0.2.0 - M2: Real LLM Integration**

- ✅ Multi-provider LLM support (OpenRouter, DeepSeek, GLM-4, OpenAI, Anthropic, Custom)
- ✅ Configuration UI with provider selection
- ✅ API key management with localStorage
- ✅ Loading states and error handling
- ✅ System prompt for task decomposition
- ✅ JSON parsing and validation
- ✅ Fallback to stub mode

**Previous: v0.1.0 - M1: Basic Implementation**

- ✅ Orchestrator button in header
- ✅ Task input modal
- ✅ Basic tab creation with agent naming
- ✅ Stub decomposition

## Next Steps (M3)

- ⬜ Agent tracking and lifecycle management
- ⬜ Tab cleanup functionality (kill agents by ID or type)
- ⬜ Keyboard shortcuts (Cmd+Shift+O)
- ⬜ Auto-close tabs when jobs complete
- ⬜ Context menu integration
- ⬜ Status indicators in header

## Troubleshooting

### Plugin not loading
- Check that `hyper-ccd-orchestrator` is in your `localPlugins` array in `.hyper.js`
- Restart Hyper completely
- Check the developer console for errors (View → Toggle Developer Tools)

### Tabs not being created
- Check the developer console for error messages
- Verify your API key is correct
- Try the fallback mode (leave API key empty)

### LLM returns invalid JSON
- The plugin attempts to auto-fix minor JSON issues
- If it fails repeatedly, try a different model or provider
- Check the console logs to see the raw LLM response

### API key not persisting
- Check browser localStorage permissions
- Try manually setting the key again
- Check for browser extensions that might block localStorage

## Contributing

Contributions welcome! Areas for improvement:

- Additional LLM provider integrations
- Improved system prompts
- Agent lifecycle management
- UI/UX enhancements
- Testing framework

## License

MIT
