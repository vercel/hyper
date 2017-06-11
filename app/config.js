const gaze = require('gaze');
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

const _watch = function () {
  gaze(cfgPath, watchCfg, function (err) {
    if (err) {
      throw err;
    }
    this.on('changed', () => {
      cfg = _import();
      notify('Configuration updated', 'Hyper configuration reloaded!');
      watchers.forEach(fn => fn());
    });
    this.on('error', () => {
      // Ignore file watching errors
    });
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
