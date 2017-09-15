const vm = require('vm');
const notify = require('../notify');

const _extract = function (script) {
  const module = {};
  script.runInNewContext({module});
  if (!module.exports) {
    throw new Error('Error reading configuration: `module.exports` not set');
  }
  return module.exports;
};

const _syntaxValidation = function (cfg) {
  try {
    return new vm.Script(cfg, {filename: '.hyper.js', displayErrors: true});
  } catch (err) {
    notify(`Error loading config: ${err.name}, see DevTools for more info`);
    console.error('Error loading config:', err);
  }
};

const _extractDefault = function (cfg) {
  return _extract(_syntaxValidation(cfg));
};

// init config
const _init = function (cfg) {
  const script = _syntaxValidation(cfg.userCfg);
  if (script) {
    const _cfg = _extract(script);
    if (!_cfg.config) {
      _cfg.plugins = _cfg.plugins || [];
      _cfg.localPlugins = _cfg.localPlugins || [];
      _cfg.keymaps = _cfg.keymaps || {};
      notify('Error reading configuration: `config` key is missing');
      return _extractDefault(cfg.defaultCfg);
    }

    // Ignore undefined values in plugin and localPlugins array Issue #1862
    _cfg.plugins = (_cfg.plugins && _cfg.plugins.filter(Boolean)) || [];
    _cfg.localPlugins = (_cfg.localPlugins && _cfg.localPlugins.filter(Boolean)) || [];
    return _cfg;
  }
  return _extractDefault(cfg.defaultCfg);
};

module.exports = _init;
