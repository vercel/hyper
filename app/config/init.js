const vm = require('vm');
const notify = require('../notify');
const mapKeys = require('../utils/map-keys');

const _extract = function(script) {
  const module = {};
  script.runInNewContext({module});
  if (!module.exports) {
    throw new Error('Error reading configuration: `module.exports` not set');
  }
  return module.exports;
};

const _syntaxValidation = function(cfg) {
  try {
    return new vm.Script(cfg, {filename: '.hyper.js', displayErrors: true});
  } catch (err) {
    notify('Error loading config:', `${err.name}, see DevTools for more info`, {error: err});
  }
};

const _extractDefault = function(cfg) {
  return _extract(_syntaxValidation(cfg));
};

// init config
const _init = function(cfg) {
  const script = _syntaxValidation(cfg.userCfg);
  if (script) {
    const _cfg = _extract(script);
    if (!_cfg.config) {
      notify('Error reading configuration: `config` key is missing');
      return cfg.defaultCfg;
    }
    // Merging platform specific keymaps with user defined keymaps
    _cfg.keymaps = mapKeys(Object.assign({}, cfg.defaultCfg.keymaps, _cfg.keymaps));
    // Ignore undefined values in plugin and localPlugins array Issue #1862
    _cfg.plugins = (_cfg.plugins && _cfg.plugins.filter(Boolean)) || [];
    _cfg.localPlugins = (_cfg.localPlugins && _cfg.localPlugins.filter(Boolean)) || [];
    return _cfg;
  }
  return cfg.defaultCfg;
};

module.exports = {
  _init,
  _extractDefault
};
