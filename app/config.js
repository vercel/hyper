const gaze = require('gaze');
const notify = require('./notify');
const _import = require('./config/import');
const _paths = require('./config/paths');
const win = require('./config/windows');

const watchers = [];
const scanInterval = 2000;
let cfg = {};

const _watch = function () {
  gaze(_paths.prodConf, process.platform === 'win32' ? {interval: scanInterval}, function (err) {
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

exports.getPlugins = function () {
  return {
    plugins: cfg.plugins,
    localPlugins: cfg.localPlugins
  };
};

exports.getConfig = function () {
  return cfg.config;
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
