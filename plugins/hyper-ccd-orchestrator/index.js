// plugins/hyper-ccd-orchestrator/index.js
const React = require('react');
const OrchestratorButton = require('./ui/OrchestratorButton');
const OrchestratorModal = require('./ui/OrchestratorModal');
const { getAgentPlan } = require('./orchestratorClient');

const ORCH_RUN_TASK = 'CCD_ORCH/RUN_TASK';
const ORCH_SPAWN_AGENT_TAB = 'CCD_ORCH/SPAWN_AGENT_TAB';
const ORCH_RESET = 'CCD_ORCH/RESET';

let cachedStore = null;

// 1) Decorate header to add the Orchestrator button + modal
exports.decorateHeader = (Header, { React: R }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        modalVisible: false,
        taskText: ''
      };
      this.openModal = this.openModal.bind(this);
      this.closeModal = this.closeModal.bind(this);
      this.runTask = this.runTask.bind(this);
    }

    openModal() {
      this.setState({ modalVisible: true });
    }

    closeModal() {
      this.setState({ modalVisible: false });
    }

    runTask() {
      const task = this.state.taskText.trim();
      if (!task || !cachedStore) {
        this.closeModal();
        return;
      }

      // Dispatch an action the middleware will handle
      cachedStore.dispatch({
        type: ORCH_RUN_TASK,
        task,
        preferences: {
          defaultAgentType: 'auto'
        }
      });

      this.closeModal();
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
          onRun: this.runTask,
          onClose: this.closeModal
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
        const { task, preferences } = action;

        try {
          const plan = await getAgentPlan(task, preferences);

          // For each agent, dispatch a spawn action
          (plan.agents || []).forEach((agent) => {
            store.dispatch({
              type: ORCH_SPAWN_AGENT_TAB,
              agent
            });
          });
        } catch (err) {
          console.error('Orchestrator error', err);
        }
        return next(action);
      }

      case ORCH_SPAWN_AGENT_TAB: {
        const { agent } = action;
        const safeId = agent.id || 'agent-' + Date.now();
        const title = safeId;
        const cmd = agent.command;

        // Create a new tab by emitting RPC
        // Based on the Hyper source code, we need to use the rpc module
        if (typeof window !== 'undefined' && window.rpc) {
          window.rpc.once('session add', ({ uid }) => {
            // Session was created, now send the command
            if (cmd) {
              // Send the command to the new session
              setTimeout(() => {
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
    default:
      return state;
  }
};
