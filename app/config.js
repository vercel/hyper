const {homedir} = require('os');
const {readFileSync, writeFileSync} = require('fs');
const {resolve} = require('path');
const vm = require('vm');

const {dialog} = require('electron');
const gaze = require('gaze');
const notify = require('./notify');
const Config = require('electron-config');

// local storage
const cache = new Config();

const path = resolve(homedir(), '.hyperterm.js');
const watchers = [];

let cfg = {};

function watch() {
  gaze(path, function (err) {
    if (err) {
      throw err;
    }
    this.on('changed', () => {
      try {
        if (exec(readFileSync(path, 'utf8'))) {
          notify('HyperTerm configuration reloaded!');
          watchers.forEach(fn => fn());
        }
      } catch (err) {
        dialog.showMessageBox({
          message: `An error occurred loading your configuration (${path}): ${err.message}`,
          buttons: ['Ok']
        });
      }
    });
  });
}

let _str; // last script
function exec(str) {
  if (str === _str) {
    return false;
  }
  _str = str;
  const script = new vm.Script(str);
  const module = {};
  script.runInNewContext({module});
  if (!module.exports) {
    throw new Error('Error reading configuration: `module.exports` not set');
  }
  const _cfg = module.exports;
  if (!_cfg.config) {
    throw new Error('Error reading configuration: `config` key is missing');
  }
  _cfg.plugins = _cfg.plugins || [];
  _cfg.localPlugins = _cfg.localPlugins || [];
  cfg = _cfg;
  return true;
}

exports.subscribe = function (fn) {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

exports.init = function () {
  try {
    exec(readFileSync(path, 'utf8'));
  } catch (err) {
    console.log('read error', path, err.message);
    const defaultConfig = readFileSync(resolve(__dirname, 'config-default.js'));
    try {
      console.log('attempting to write default config to', path);
      exec(defaultConfig);
      writeFileSync(path, defaultConfig);
    } catch (err) {
      throw new Error(`Failed to write config to ${path}`);
    }
  }
  watch();
};

exports.getConfig = function () {
  return cfg.config;
};

exports.getPlugins = function () {
  return {
    plugins: cfg.plugins,
    localPlugins: cfg.localPlugins
  };
};

exports.recordScreenState = function (screenPosition) {
  cache.set('screenPosition', screenPosition);
};

exports.getScreenState = function () {
  return cache.get('screenPosition');
};
