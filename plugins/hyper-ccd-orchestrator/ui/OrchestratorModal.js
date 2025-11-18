// plugins/hyper-ccd-orchestrator/ui/OrchestratorModal.js
const React = require('react');
const { getProviders } = require('../orchestratorClient');

function OrchestratorModal({
  visible,
  value,
  onChange,
  config,
  onConfigChange,
  onRun,
  onClose,
  loading,
  error
}) {
  const [showSettings, setShowSettings] = React.useState(false);
  const providers = getProviders();

  if (!visible) return null;

  const currentProvider = providers.find(p => p.id === (config.provider || 'openrouter'));

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
        zIndex: 9999
      },
      onClick: onClose
    },
    React.createElement(
      'div',
      {
        style: {
          width: '600px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
          border: '1px solid #333'
        },
        onClick: (e) => e.stopPropagation()
      },
      // Header
      React.createElement(
        'div',
        { style: { marginBottom: '16px' } },
        React.createElement(
          'h3',
          { style: { margin: '0 0 4px 0', fontSize: '18px', color: '#fff' } },
          'Orchestrator Task'
        ),
        React.createElement(
          'p',
          { style: { margin: 0, fontSize: '12px', color: '#888' } },
          'Describe your task in natural language'
        )
      ),

      // Task Input
      React.createElement('textarea', {
        style: {
          width: '100%',
          height: '120px',
          background: '#0a0a0a',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid #333',
          resize: 'vertical',
          fontFamily: 'inherit',
          fontSize: '14px',
          outline: 'none'
        },
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder: 'e.g., "Set up a NestJS API with PostgreSQL and JWT authentication"',
        disabled: loading
      }),

      // Settings Toggle
      React.createElement(
        'div',
        { style: { marginTop: '12px' } },
        React.createElement(
          'button',
          {
            onClick: () => setShowSettings(!showSettings),
            style: {
              background: 'transparent',
              border: 'none',
              color: '#0af',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '4px 0',
              textDecoration: 'underline'
            }
          },
          showSettings ? '▼ Hide Settings' : '▶ Show Settings'
        )
      ),

      // Settings Panel
      showSettings && React.createElement(
        'div',
        {
          style: {
            marginTop: '12px',
            padding: '12px',
            background: '#0a0a0a',
            borderRadius: '8px',
            border: '1px solid #333'
          }
        },

        // Provider Selection
        React.createElement(
          'div',
          { style: { marginBottom: '12px' } },
          React.createElement(
            'label',
            { style: { display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' } },
            'Provider'
          ),
          React.createElement(
            'select',
            {
              value: config.provider || 'openrouter',
              onChange: (e) => onConfigChange({ ...config, provider: e.target.value }),
              style: {
                width: '100%',
                padding: '6px 8px',
                background: '#000',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
                fontSize: '13px',
                outline: 'none'
              },
              disabled: loading
            },
            providers.map(p =>
              React.createElement('option', { key: p.id, value: p.id }, p.name)
            )
          )
        ),

        // API Key
        React.createElement(
          'div',
          { style: { marginBottom: '12px' } },
          React.createElement(
            'label',
            { style: { display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' } },
            'API Key',
            React.createElement(
              'span',
              { style: { color: '#f44', marginLeft: '4px' } },
              '*'
            )
          ),
          React.createElement('input', {
            type: 'password',
            value: config.apiKey || '',
            onChange: (e) => onConfigChange({ ...config, apiKey: e.target.value }),
            placeholder: 'Enter your API key...',
            style: {
              width: '100%',
              padding: '6px 8px',
              background: '#000',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none'
            },
            disabled: loading
          })
        ),

        // Model
        React.createElement(
          'div',
          { style: { marginBottom: '12px' } },
          React.createElement(
            'label',
            { style: { display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' } },
            'Model (optional)'
          ),
          React.createElement('input', {
            type: 'text',
            value: config.model || '',
            onChange: (e) => onConfigChange({ ...config, model: e.target.value }),
            placeholder: currentProvider ? currentProvider.defaultModel : 'Default model',
            style: {
              width: '100%',
              padding: '6px 8px',
              background: '#000',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none'
            },
            disabled: loading
          }),
          React.createElement(
            'div',
            { style: { fontSize: '11px', color: '#666', marginTop: '4px' } },
            currentProvider && `Default: ${currentProvider.defaultModel}`
          )
        ),

        // Custom Endpoint (for custom provider)
        config.provider === 'custom' && React.createElement(
          'div',
          { style: { marginBottom: '12px' } },
          React.createElement(
            'label',
            { style: { display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' } },
            'Custom Endpoint',
            React.createElement(
              'span',
              { style: { color: '#f44', marginLeft: '4px' } },
              '*'
            )
          ),
          React.createElement('input', {
            type: 'text',
            value: config.customEndpoint || '',
            onChange: (e) => onConfigChange({ ...config, customEndpoint: e.target.value }),
            placeholder: 'https://api.example.com/v1/chat/completions',
            style: {
              width: '100%',
              padding: '6px 8px',
              background: '#000',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none'
            },
            disabled: loading
          })
        ),

        // Info text
        React.createElement(
          'div',
          { style: { fontSize: '11px', color: '#666', marginTop: '8px', lineHeight: '1.4' } },
          'Settings are saved in browser storage. Your API key is stored locally and never sent anywhere except to the selected provider.'
        )
      ),

      // Error Message
      error && React.createElement(
        'div',
        {
          style: {
            marginTop: '12px',
            padding: '8px 12px',
            background: '#2a0a0a',
            border: '1px solid #f44',
            borderRadius: '6px',
            color: '#f88',
            fontSize: '12px'
          }
        },
        error
      ),

      // Action Buttons
      React.createElement(
        'div',
        { style: { marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
        React.createElement(
          'button',
          {
            onClick: onClose,
            disabled: loading,
            style: {
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #555',
              background: 'transparent',
              color: loading ? '#555' : '#aaa',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }
          },
          'Cancel'
        ),
        React.createElement(
          'button',
          {
            onClick: onRun,
            disabled: loading || !value.trim(),
            style: {
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              background: loading || !value.trim() ? '#444' : '#0af',
              color: loading || !value.trim() ? '#888' : '#000',
              cursor: loading || !value.trim() ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }
          },
          loading ? 'Processing...' : 'Run Orchestrator'
        )
      )
    )
  );
}

module.exports = OrchestratorModal;
