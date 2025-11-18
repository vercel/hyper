// plugins/hyper-ccd-orchestrator/ui/RenameModal.js
const React = require('react');

function RenameModal({ visible, currentName, onRename, onClose }) {
  const [name, setName] = React.useState(currentName || '');

  React.useEffect(() => {
    if (visible) {
      setName(currentName || '');
    }
  }, [visible, currentName]);

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      onRename(trimmedName);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      },
      onClick: onClose
    },
    React.createElement(
      'div',
      {
        style: {
          width: '400px',
          maxWidth: '90vw',
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
          border: '1px solid #333'
        },
        onClick: (e) => e.stopPropagation()
      },
      React.createElement(
        'form',
        { onSubmit: handleSubmit },

        // Header
        React.createElement(
          'div',
          { style: { marginBottom: '16px' } },
          React.createElement(
            'h3',
            { style: { margin: '0 0 4px 0', fontSize: '16px', color: '#fff' } },
            'Rename Terminal'
          ),
          React.createElement(
            'p',
            { style: { margin: 0, fontSize: '12px', color: '#888' } },
            'Enter a new name for this terminal session'
          )
        ),

        // Input
        React.createElement('input', {
          type: 'text',
          value: name,
          onChange: (e) => setName(e.target.value),
          onKeyDown: handleKeyDown,
          placeholder: 'Terminal name...',
          autoFocus: true,
          style: {
            width: '100%',
            padding: '10px 12px',
            background: '#0a0a0a',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit'
          }
        }),

        // Buttons
        React.createElement(
          'div',
          { style: { marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: onClose,
              style: {
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #555',
                background: 'transparent',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '13px'
              }
            },
            'Cancel'
          ),
          React.createElement(
            'button',
            {
              type: 'submit',
              disabled: !name.trim(),
              style: {
                padding: '8px 20px',
                borderRadius: '6px',
                border: 'none',
                background: name.trim() ? '#0af' : '#444',
                color: name.trim() ? '#000' : '#888',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: '600'
              }
            },
            'Rename'
          )
        )
      )
    )
  );
}

module.exports = RenameModal;
