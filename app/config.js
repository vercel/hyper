const {homedir} = require('os');
const {statSync, renameSync, readFileSync, writeFileSync} = require('fs');
const {resolve} = require('path');
const vm = require('vm');

const {dialog} = require('electron');
const gaze = require('gaze');
const Config = require('electron-config');
const notify = require('./notify');

// local storage
const winCfg = new Config({
  defaults: {
    windowPosition: [50, 50],
    windowSize: [540, 380]
  }
});

const path = resolve(homedir(), '.hyper.js');
const pathLegacy = resolve(homedir(), '.hyperterm.js');
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
          notify('Hyper configuration reloaded!');
          watchers.forEach(fn => fn());
        }
      } catch (err) {
        dialog.showMessageBox({
          message: `An error occurred loading your configuration (${path}): ${err.message}`,
          buttons: ['Ok']
        });
      }
    });
    this.on('error', () => {
      // Ignore file watching errors
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
  // for backwards compatibility with hyperterm
  // (prior to the rename), we try to rename
  // on behalf of the user
  try {
    statSync(pathLegacy);
    renameSync(pathLegacy, path);
  } catch (err) {
    // ignore
  }

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

exports.window = {
  get() {
    const position = winCfg.get('windowPosition');
    const size = winCfg.get('windowSize');
    return {position, size};
  },
  recordState(win) {
    winCfg.set('windowPosition', win.getPosition());
    winCfg.set('windowSize', win.getSize());
  }
};
