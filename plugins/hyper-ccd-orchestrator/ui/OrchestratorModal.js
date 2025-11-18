// plugins/hyper-ccd-orchestrator/ui/OrchestratorModal.js
const React = require('react');

function OrchestratorModal({ visible, value, onChange, onRun, onClose }) {
  if (!visible) return null;

  return React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }
    },
    React.createElement(
      'div',
      {
        style: {
          width: '480px',
          background: '#111',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.7)'
        }
      },
      React.createElement(
        'h3',
        { style: { marginTop: 0, marginBottom: '8px' } },
        'Orchestrator Task'
      ),
      React.createElement('textarea', {
        style: {
          width: '100%',
          height: '160px',
          background: '#000',
          color: '#fff',
          borderRadius: '8px',
          padding: '8px',
          border: '1px solid #333',
          resize: 'vertical'
        },
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder: 'Describe what you want CCD/Codex to do...'
      }),
      React.createElement(
        'div',
        { style: { marginTop: '12px', textAlign: 'right' } },
        React.createElement(
          'button',
          {
            onClick: onClose,
            style: {
              marginRight: '8px',
              padding: '4px 10px',
              borderRadius: '999px',
              border: '1px solid #555',
              background: 'transparent',
              color: '#aaa',
              cursor: 'pointer'
            }
          },
          'Cancel'
        ),
        React.createElement(
          'button',
          {
            onClick: onRun,
            style: {
              padding: '4px 12px',
              borderRadius: '999px',
              border: '1px solid #0af',
              background: '#0af',
              color: '#000',
              cursor: 'pointer'
            }
          },
          'Run'
        )
      )
    )
  );
}

module.exports = OrchestratorModal;
