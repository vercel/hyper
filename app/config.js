const chokidar = require('chokidar');
const notify = require('./notify');
const _import = require('./config/import');
const _openConfig = require('./config/open');
const win = require('./config/windows');
const {cfgPath, cfgDir} = require('./config/paths');

const watchers = [];
// watch for changes on config every 2s on windows
// https://github.com/zeit/hyper/pull/1772
const watchCfg = process.platform === 'win32' ? {interval: 2000} : {};
let cfg = {};
let _watcher;

const _watch = function () {
  if (_watcher) {
    return _watcher;
  }

  _watcher = chokidar.watch(cfgPath, watchCfg);

  _watcher.on('change', () => {
    cfg = _import();
    notify('Configuration updated', 'Hyper configuration reloaded!');
    watchers.forEach(fn => fn());
    checkDeprecatedConfig()
  });

  _watcher.on('error', error => {
    console.error('error watching config', error);
  });
};

exports.subscribe = function (fn) {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

exports.getConfigDir = function () {
  // expose config directory to load plugin from the right place
  return cfgDir;
};

exports.getConfig = function () {
  return cfg.config;
};

exports.openConfig = function () {
  return _openConfig();
};

exports.getPlugins = function () {
  return {
    plugins: cfg.plugins,
    localPlugins: cfg.localPlugins
  };
};

exports.getKeymaps = function () {
  return cfg.keymaps;
};

exports.extendKeymaps = function (keymaps) {
  if (keymaps) {
    cfg.keymaps = keymaps;
  }
};

exports.setup = function () {
  cfg = _import();
  _watch();
  checkDeprecatedConfig()
};

exports.getWin = win.get;
exports.winRecord = win.recordState;

const getDeprecatedCSS = function (config) {
  const deprecated = [];
  const deprecatedCSS = [
    'x-screen',
    'x-row',
    'cursor-node',
    '::selection'
  ];
  deprecatedCSS.forEach(css => {
    if ((config.css && config.css.indexOf(css) !== -1) ||
        (config.termCSS && config.termCSS.indexOf(css) !== -1)) {
      deprecated.push(css);
    }
  })
  return deprecated;
}
exports.getDeprecatedCSS = getDeprecatedCSS;

const checkDeprecatedConfig = function () {
  if (!cfg.config) {
    return;
  }
  const deprecated = getDeprecatedCSS(cfg.config);
  if (deprecated.length === 0) {
    return;
  }
  const deprecatedStr = deprecated.join(', ');
  notify('Configuration warning', `Your configuration uses some deprecated CSS classes (${deprecatedStr})`)
}
