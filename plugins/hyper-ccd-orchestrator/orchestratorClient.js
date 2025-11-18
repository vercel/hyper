// plugins/hyper-ccd-orchestrator/orchestratorClient.js

/**
 * LLM Provider configurations
 */
const PROVIDERS = {
  openrouter: {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    type: 'openai-compatible'
  },
  deepseek: {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    defaultModel: 'deepseek-chat',
    type: 'openai-compatible'
  },
  glm: {
    name: 'GLM-4',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    defaultModel: 'glm-4-plus',
    type: 'openai-compatible'
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    type: 'openai-compatible'
  },
  anthropic: {
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-5-sonnet-20241022',
    type: 'anthropic'
  },
  custom: {
    name: 'Custom OpenAI-Compatible',
    endpoint: '',
    defaultModel: '',
    type: 'openai-compatible'
  }
};

/**
 * System prompt for task decomposition
 */
const SYSTEM_PROMPT = `You are an intelligent task orchestrator for a terminal environment. Your job is to decompose high-level development tasks into specific, actionable agent tasks.

You have access to two types of agents:
1. CCD agents: Research, analysis, documentation, and planning tasks
2. Codex agents: Implementation, coding, and execution tasks

For each task you receive, break it down into specific subtasks and output ONLY a valid JSON object following this exact schema:

{
  "agents": [
    {
      "id": "ccd-<short-slug>",
      "type": "ccd",
      "description": "Brief description of what this agent will do",
      "command": "ccd \\"Detailed instruction for this specific task\\""
    },
    {
      "id": "codex-<short-slug>",
      "type": "codex",
      "description": "Brief description of what this agent will do",
      "command": "codex \\"Detailed instruction for this specific task\\""
    }
  ]
}

Rules:
- Always output valid JSON only, no markdown or explanation
- Use lowercase with hyphens for IDs (e.g., "ccd-setup-database", "codex-api-implementation")
- Keep IDs under 40 characters
- Be specific and actionable in commands
- Typical tasks need 2-5 agents
- Order agents logically (research before implementation)
- Each command should be a complete, self-contained instruction

Example input: "Set up a NestJS API with PostgreSQL and JWT auth"
Example output:
{
  "agents": [
    {
      "id": "ccd-research-nestjs-auth",
      "type": "ccd",
      "description": "Research NestJS authentication best practices",
      "command": "ccd \\"Research NestJS JWT authentication patterns, best practices for PostgreSQL integration, and recommended project structure. Provide a summary of the recommended approach.\\""
    },
    {
      "id": "codex-setup-project",
      "type": "codex",
      "description": "Initialize NestJS project with dependencies",
      "command": "codex \\"Create a new NestJS project, install required dependencies (@nestjs/jwt, @nestjs/passport, passport-jwt, pg, @nestjs/typeorm, typeorm), and set up the basic project structure\\""
    },
    {
      "id": "codex-database-setup",
      "type": "codex",
      "description": "Configure PostgreSQL and TypeORM",
      "command": "codex \\"Set up TypeORM configuration for PostgreSQL, create database connection module, and set up initial User entity for authentication\\""
    },
    {
      "id": "codex-auth-implementation",
      "type": "codex",
      "description": "Implement JWT authentication",
      "command": "codex \\"Create authentication module with JWT strategy, implement login/register endpoints, add authentication guards, and create protected route examples\\""
    },
    {
      "id": "ccd-test-and-verify",
      "type": "ccd",
      "description": "Test the authentication flow",
      "command": "ccd \\"Test the authentication endpoints, verify JWT token generation and validation, check database connections, and document any issues found\\""
    }
  ]
}`;

/**
 * Call OpenAI-compatible API
 */
async function callOpenAICompatible(endpoint, apiKey, model, task) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...(endpoint.includes('openrouter.ai') && {
        'HTTP-Referer': 'https://github.com/mohammadasim224/myhyper',
        'X-Title': 'Hyper CCD Orchestrator'
      })
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: task
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in API response');
  }

  return content;
}

/**
 * Call Anthropic API
 */
async function callAnthropic(apiKey, model, task) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: task
        }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error('No content in Anthropic response');
  }

  return content;
}

/**
 * Parse LLM response and extract JSON
 */
function parseAgentPlan(content) {
  // Remove markdown code blocks if present
  let jsonStr = content.trim();

  // Remove ```json and ``` markers
  jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

  // Try to find JSON object in the content
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    const plan = JSON.parse(jsonStr);

    // Validate the plan structure
    if (!plan.agents || !Array.isArray(plan.agents)) {
      throw new Error('Invalid plan: missing or invalid "agents" array');
    }

    // Validate each agent
    plan.agents.forEach((agent, index) => {
      if (!agent.id || !agent.type || !agent.description || !agent.command) {
        throw new Error(`Invalid agent at index ${index}: missing required fields`);
      }

      if (!['ccd', 'codex'].includes(agent.type)) {
        throw new Error(`Invalid agent type at index ${index}: ${agent.type}`);
      }

      // Ensure ID follows naming convention
      if (!agent.id.match(/^(ccd|codex)-[a-z0-9-]+$/)) {
        console.warn(`Agent ID doesn't follow convention: ${agent.id}, auto-fixing...`);
        agent.id = `${agent.type}-${slugify(agent.description || `task-${index}`)}`;
      }
    });

    return plan;
  } catch (error) {
    console.error('Failed to parse agent plan:', error);
    console.error('LLM response:', content);
    throw new Error(`Failed to parse agent plan: ${error.message}`);
  }
}

/**
 * Main function to get agent plan from LLM
 */
async function getAgentPlan(task, config = {}) {
  const {
    provider = 'openrouter',
    apiKey = '',
    model = '',
    customEndpoint = '',
    useFallback = true
  } = config;

  // Validate inputs
  if (!task || task.trim().length === 0) {
    throw new Error('Task description is required');
  }

  if (!apiKey || apiKey.trim().length === 0) {
    if (useFallback) {
      console.warn('No API key provided, using fallback stub mode');
      return getFallbackPlan(task);
    }
    throw new Error('API key is required');
  }

  // Get provider config
  const providerConfig = PROVIDERS[provider];
  if (!providerConfig) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  // Determine endpoint and model
  const endpoint = provider === 'custom' && customEndpoint
    ? customEndpoint
    : providerConfig.endpoint;
  const selectedModel = model || providerConfig.defaultModel;

  if (!endpoint) {
    throw new Error('API endpoint is required');
  }

  try {
    let content;

    // Call appropriate API based on provider type
    if (providerConfig.type === 'anthropic') {
      content = await callAnthropic(apiKey, selectedModel, task);
    } else {
      content = await callOpenAICompatible(endpoint, apiKey, selectedModel, task);
    }

    // Parse and validate the response
    return parseAgentPlan(content);

  } catch (error) {
    console.error('LLM API call failed:', error);

    if (useFallback) {
      console.warn('Falling back to stub mode due to error');
      return getFallbackPlan(task);
    }

    throw error;
  }
}

/**
 * Fallback plan generator (same as original stub)
 */
function getFallbackPlan(task) {
  const agents = [
    {
      id: 'ccd-research-' + slugify(task),
      type: 'ccd',
      description: 'Research task for: ' + task,
      command: `ccd "Research: ${task} and summarise"`
    },
    {
      id: 'codex-impl-' + slugify(task),
      type: 'codex',
      description: 'Implementation task for: ' + task,
      command: `codex "Implement task: ${task}"`
    }
  ];

  return { agents };
}

/**
 * Utility function to create URL-safe slugs
 */
function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

/**
 * Get list of available providers
 */
function getProviders() {
  return Object.entries(PROVIDERS).map(([key, config]) => ({
    id: key,
    name: config.name,
    defaultModel: config.defaultModel,
    endpoint: config.endpoint
  }));
}

module.exports = {
  getAgentPlan,
  getProviders,
  PROVIDERS
};
