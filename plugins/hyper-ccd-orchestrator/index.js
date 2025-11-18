// plugins/hyper-ccd-orchestrator/index.js
const React = require('react');
const OrchestratorButton = require('./ui/OrchestratorButton');
const OrchestratorModal = require('./ui/OrchestratorModal');
const { getAgentPlan } = require('./orchestratorClient');

const ORCH_RUN_TASK = 'CCD_ORCH/RUN_TASK';
const ORCH_SPAWN_AGENT_TAB = 'CCD_ORCH/SPAWN_AGENT_TAB';
const ORCH_RESET = 'CCD_ORCH/RESET';
const ORCH_SET_LOADING = 'CCD_ORCH/SET_LOADING';
const ORCH_SET_ERROR = 'CCD_ORCH/SET_ERROR';

const CONFIG_STORAGE_KEY = 'hyper-ccd-orchestrator-config';

let cachedStore = null;

// Helper functions for localStorage
function loadConfig() {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
  return {
    provider: 'openrouter',
    apiKey: '',
    model: '',
    customEndpoint: ''
  };
}

function saveConfig(config) {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

// 1) Decorate header to add the Orchestrator button + modal
exports.decorateHeader = (Header, { React: R }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        modalVisible: false,
        taskText: '',
        config: loadConfig(),
        loading: false,
        error: null
      };
      this.openModal = this.openModal.bind(this);
      this.closeModal = this.closeModal.bind(this);
      this.runTask = this.runTask.bind(this);
      this.handleConfigChange = this.handleConfigChange.bind(this);
    }

    openModal() {
      this.setState({
        modalVisible: true,
        error: null
      });
    }

    closeModal() {
      if (!this.state.loading) {
        this.setState({
          modalVisible: false,
          error: null
        });
      }
    }

    handleConfigChange(newConfig) {
      this.setState({ config: newConfig });
      saveConfig(newConfig);
    }

    async runTask() {
      const task = this.state.taskText.trim();
      if (!task || !cachedStore) {
        return;
      }

      this.setState({ loading: true, error: null });

      try {
        // Dispatch an action the middleware will handle
        await cachedStore.dispatch({
          type: ORCH_RUN_TASK,
          task,
          config: this.state.config
        });

        // Success - close modal and reset task
        this.setState({
          modalVisible: false,
          taskText: '',
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Orchestrator task failed:', error);
        this.setState({
          loading: false,
          error: error.message || 'Failed to process task'
        });
      }
    }

    render() {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(Header, this.props),
        React.createElement(OrchestratorButton, { onClick: this.openModal }),
        React.createElement(OrchestratorModal, {
          visible: this.state.modalVisible,
          value: this.state.taskText,
          onChange: (taskText) => this.setState({ taskText }),
          config: this.state.config,
          onConfigChange: this.handleConfigChange,
          onRun: this.runTask,
          onClose: this.closeModal,
          loading: this.state.loading,
          error: this.state.error
        })
      );
    }
  };
};

// 2) Capture store so we can dispatch from UI
exports.middleware = (store) => {
  cachedStore = store;

  return (next) => async (action) => {
    switch (action.type) {
      case ORCH_RUN_TASK: {
        const { task, config } = action;

        try {
          // Call LLM to get agent plan
          const plan = await getAgentPlan(task, config);

          // Log the plan for debugging
          console.log('Orchestrator plan:', plan);

          // For each agent, dispatch a spawn action
          if (plan.agents && Array.isArray(plan.agents)) {
            plan.agents.forEach((agent) => {
              store.dispatch({
                type: ORCH_SPAWN_AGENT_TAB,
                agent
              });
            });
          }
        } catch (err) {
          console.error('Orchestrator error:', err);
          // Re-throw so the UI can catch it
          throw err;
        }
        return next(action);
      }

      case ORCH_SPAWN_AGENT_TAB: {
        const { agent } = action;
        const safeId = agent.id || 'agent-' + Date.now();
        const title = safeId;
        const cmd = agent.command;

        console.log('Spawning agent tab:', { id: safeId, description: agent.description });

        // Create a new tab by emitting RPC
        // Based on the Hyper source code, we need to use the rpc module
        if (typeof window !== 'undefined' && window.rpc) {
          window.rpc.once('session add', ({ uid }) => {
            console.log('Session created:', uid);
            // Session was created, now send the command
            if (cmd) {
              // Send the command to the new session
              setTimeout(() => {
                console.log('Sending command to session:', cmd);
                window.rpc.emit('data', { uid, data: cmd + '\r' });
              }, 100);
            }
          });

          // Request a new session (new tab)
          const state = store.getState();
          const cwd = state.ui && state.ui.cwd ? state.ui.cwd : undefined;
          window.rpc.emit('new', {
            isNewGroup: true,
            cwd,
            // We'll set the title via session title after creation
          });

          // Set title after a short delay to allow session to be created
          setTimeout(() => {
            const state = store.getState();
            const sessions = state.sessions && state.sessions.sessions;
            if (sessions) {
              const sessionIds = Object.keys(sessions);
              if (sessionIds.length > 0) {
                const lastSessionId = sessionIds[sessionIds.length - 1];
                console.log('Setting session title:', title);
                // Dispatch action to set the session title
                store.dispatch({
                  type: 'SESSION_SET_XTERM_TITLE',
                  uid: lastSessionId,
                  title
                });
              }
            }
          }, 200);
        }

        return next(action);
      }

      default:
        return next(action);
    }
  };
};

// 3) Optional: track orchestrator state in UI reducer
exports.reduceUI = (state, action) => {
  switch (action.type) {
    case ORCH_RESET:
      return state.set('ccdOrchLastTask', null);
    case ORCH_RUN_TASK:
      return state.set('ccdOrchLastTask', action.task);
    case ORCH_SET_LOADING:
      return state.set('ccdOrchLoading', action.loading);
    case ORCH_SET_ERROR:
      return state.set('ccdOrchError', action.error);
    default:
      return state;
  }
};
