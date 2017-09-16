const fs = require('fs');
const notify = require('./notify');
const _import = require('./config/import');
const _openConfig = require('./config/open');
const win = require('./config/windows');
const {cfgPath, cfgDir} = require('./config/paths');

const watchers = [];
let cfg = {};
let _watcher;

const _watch = function () {
  if (_watcher) {
    return _watcher;
  }

  if (process.platform === 'win32') {
    // watch for changes on config every 2s on windows
    // https://github.com/zeit/hyper/pull/1772
    _watcher = fs.watchFile(cfgPath, {interval: 2000});
  } else {
    _watcher = fs.watch(cfgPath);
  }

  _watcher.on('change', () => {
    cfg = _import();
    notify('Configuration updated', 'Hyper configuration reloaded!');
    watchers.forEach(fn => fn());
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
};

exports.getWin = win.get;
exports.winRecord = win.recordState;
