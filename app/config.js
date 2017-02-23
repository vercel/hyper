const gaze = require('gaze');
const notify = require('./notify');
const _import = require('./config/import');
const _paths = require('./config/paths');
const win = require('./config/windows');

const watchers = [];
const scanInterval = 2000;
let cfg = {};

const _watch = function () {
  gaze(_paths.preferencesPath, process.platform === 'win32' ? {interval: scanInterval}, function (err) {
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

const _subscribe = function (fn) {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

const _getPlugins = function () {
  return {
    plugins: cfg.plugins,
    localPlugins: cfg.localPlugins
  };
};

const _getConfig = function () {
  return cfg.config;
};

const _getKeymaps = function () {
  return cfg.keymaps;
};

const _setup = function() {
  cfg = _import();
  _watch();
};

module.exports = {
  setup: _setup,
  subscribe: _subscribe,
  getPlugins: _getPlugins,
  getConfig: _getConfig,
  getKeymaps: _getKeymaps,
  getWin: win.get,
  winRecord: win.recordState
};
