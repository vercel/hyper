// plugins/hyper-ccd-orchestrator/ui/OrchestratorButton.js
const React = require('react');

function OrchestratorButton({ onClick }) {
  return React.createElement(
    'button',
    {
      onClick,
      style: {
        marginLeft: '8px',
        padding: '2px 8px',
        borderRadius: '999px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'transparent',
        color: 'inherit',
        fontSize: '11px',
        cursor: 'pointer'
      }
    },
    'Orchestrate'
  );
}

module.exports = OrchestratorButton;
