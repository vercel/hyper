// plugins/hyper-ccd-orchestrator/orchestratorClient.js

// Simple orchestrator stub – replace with real LLM call
async function getAgentPlan(task, preferences = {}) {
  // In v0, fake a simple decomposition so you can test the tab creation flow
  const defaultType = preferences.defaultAgentType || 'auto';

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

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

module.exports = {
  getAgentPlan
};
