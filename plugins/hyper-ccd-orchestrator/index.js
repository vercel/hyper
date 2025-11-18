// plugins/hyper-ccd-orchestrator/index.js
const React = require('react');
const OrchestratorButton = require('./ui/OrchestratorButton');
const OrchestratorModal = require('./ui/OrchestratorModal');
const RenameModal = require('./ui/RenameModal');
const { getAgentPlan } = require('./orchestratorClient');
const { renameTerminal, splitVertical, splitHorizontal } = require('./windowControls');

const ORCH_RUN_TASK = 'CCD_ORCH/RUN_TASK';
const ORCH_SPAWN_AGENT_TAB = 'CCD_ORCH/SPAWN_AGENT_TAB';
const ORCH_RESET = 'CCD_ORCH/RESET';
const ORCH_SET_LOADING = 'CCD_ORCH/SET_LOADING';
const ORCH_SET_ERROR = 'CCD_ORCH/SET_ERROR';
const ORCH_SHOW_RENAME = 'CCD_ORCH/SHOW_RENAME';
const ORCH_HIDE_RENAME = 'CCD_ORCH/HIDE_RENAME';

const CONFIG_STORAGE_KEY = 'hyper-ccd-orchestrator-config';

let cachedStore = null;
let renameModalState = {
  visible: false,
  sessionUid: null,
  currentName: '',
  callback: null
};

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

// 2) Decorate Terms to add rename modal
exports.decorateTerms = (Terms, { React }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        renameVisible: false,
        renameSessionUid: null,
        renameCurrentName: ''
      };
      this.showRename = this.showRename.bind(this);
      this.hideRename = this.hideRename.bind(this);
      this.handleRename = this.handleRename.bind(this);
    }

    componentDidMount() {
      // Listen for rename command
      window.addEventListener('ccd-orch-rename', this.showRename);
    }

    componentWillUnmount() {
      window.removeEventListener('ccd-orch-rename', this.showRename);
    }

    showRename(event) {
      const { uid, name } = event.detail || {};
      if (uid) {
        this.setState({
          renameVisible: true,
          renameSessionUid: uid,
          renameCurrentName: name || ''
        });
      }
    }

    hideRename() {
      this.setState({
        renameVisible: false,
        renameSessionUid: null,
        renameCurrentName: ''
      });
    }

    handleRename(newName) {
      if (this.state.renameSessionUid && cachedStore) {
        cachedStore.dispatch(renameTerminal(this.state.renameSessionUid, newName));
      }
      this.hideRename();
    }

    render() {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(Terms, this.props),
        React.createElement(RenameModal, {
          visible: this.state.renameVisible,
          currentName: this.state.renameCurrentName,
          onRename: this.handleRename,
          onClose: this.hideRename
        })
      );
    }
  };
};

// 3) Add keymaps for split and rename
exports.decorateKeymaps = (keymaps) => {
  return Object.assign({}, keymaps, {
    'terminal:rename': 'ctrl+shift+r',
    'terminal:split-vertical': 'ctrl+shift+e',
    'terminal:split-horizontal': 'ctrl+shift+o'
  });
};

// 4) Decorate Hyper to register command handlers
exports.decorateHyper = (Hyper, { React }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.commandHandlers = {
        'terminal:rename': this.handleRenameCommand.bind(this),
        'terminal:split-vertical': this.handleSplitVertical.bind(this),
        'terminal:split-horizontal': this.handleSplitHorizontal.bind(this)
      };
    }

    componentDidMount() {
      // Register command handlers
      if (window.rpc) {
        Object.keys(this.commandHandlers).forEach(command => {
          window.rpc.on(`command ${command}`, this.commandHandlers[command]);
        });
      }
    }

    componentWillUnmount() {
      // Unregister command handlers
      if (window.rpc) {
        Object.keys(this.commandHandlers).forEach(command => {
          window.rpc.removeListener(`command ${command}`, this.commandHandlers[command]);
        });
      }
    }

    handleRenameCommand() {
      if (!cachedStore) return;

      const state = cachedStore.getState();
      const activeUid = state.sessions && state.sessions.activeUid;

      if (activeUid) {
        const session = state.sessions.sessions[activeUid];
        const currentName = session && session.title ? session.title : '';

        // Dispatch custom event to show rename modal
        window.dispatchEvent(new CustomEvent('ccd-orch-rename', {
          detail: { uid: activeUid, name: currentName }
        }));
      }
    }

    handleSplitVertical() {
      if (!cachedStore) return;

      const state = cachedStore.getState();
      const activeUid = state.sessions && state.sessions.activeUid;

      if (activeUid) {
        const session = state.sessions.sessions[activeUid];
        const profile = session && session.profile;
        cachedStore.dispatch(splitVertical(activeUid, profile));
      }
    }

    handleSplitHorizontal() {
      if (!cachedStore) return;

      const state = cachedStore.getState();
      const activeUid = state.sessions && state.sessions.activeUid;

      if (activeUid) {
        const session = state.sessions.sessions[activeUid];
        const profile = session && session.profile;
        cachedStore.dispatch(splitHorizontal(activeUid, profile));
      }
    }

    render() {
      return React.createElement(Hyper, this.props);
    }
  };
};

// 5) Capture store so we can dispatch from UI
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

// 6) Optional: track orchestrator state in UI reducer
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
