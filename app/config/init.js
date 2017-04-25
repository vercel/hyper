const vm = require('vm');

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
    return new vm.Script(cfg);
  } catch (err) {
    err.stack = 'Error reading configuration: Syntax error found';
    throw err;
  }
};

// init config
const _init = function (cfg) {
  const script = _syntaxValidation(cfg);
  if (script) {
    const _cfg = _extract(script);
    if (!_cfg.config) {
      throw new Error('Error reading configuration: `config` key is missing');
    }
    _cfg.plugins = _cfg.plugins || [];
    _cfg.localPlugins = _cfg.localPlugins || [];
    _cfg.keymaps = _cfg.keymaps || {};
    return _cfg;
  }
};

module.exports = _init;
