const vm = require('vm');

const _extract = function (str) {
  const script = new vm.Script(str);
  const module = {};
  script.runInNewContext({module});
  if (!module.exports) {
    throw new Error('Error reading configuration: `module.exports` not set');
  }
  return module.exports;
};

// init config
const _init = function (cfg) {
  const _cfg = _extract(cfg);
  if (!_cfg.config) {
    throw new Error('Error reading configuration: `config` key is missing');
  }
  _cfg.plugins = _cfg.plugins || [];
  _cfg.localPlugins = _cfg.localPlugins || [];
  _cfg.keymaps = _cfg.keymaps || {};
  return _cfg;
};

module.exports = _init;
