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
      return new vm.Script(cfg, { filename: '.hyper.js', displayErrors: true })
    } catch (error) {
      notify(`Error loading config: ${error.name}, see DevTools for more info`)
      console.error('Error loading config:', error)
      return
    }
};

const _extractDefault = function (cfg) {
  return _extract(_syntaxValidation(cfg));
};

// init config
const _init = function (cfg) {
  const script = _syntaxValidation(cfg.userConf);
  if (script) {
    const _cfg = _extract(script);
    if (!_cfg.config) {
      _cfg.plugins = _cfg.plugins || [];
      _cfg.localPlugins = _cfg.localPlugins || [];
      _cfg.keymaps = _cfg.keymaps || {};
      notify('Error reading configuration: `config` key is missing');
      return _extractDefault(cfg.defaultConf);
    }
    return _cfg;
  }
  return _extractDefault(cfg.defaultConf);
};

module.exports = _init;
