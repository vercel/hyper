const fs = require('fs');
const notify = require('./notify');
const {_import, getDefaultConfig} = require('./config/import');
const _openConfig = require('./config/open');
const win = require('./config/windows');
const {cfgPath, cfgDir} = require('./config/paths');

const watchers = [];
let cfg = {};
let _watcher;

const _watch = function() {
  if (_watcher) {
    return _watcher;
  }

  const onChange = () => {
    cfg = _import();
    notify('Configuration updated', 'Hyper configuration reloaded!');
    watchers.forEach(fn => fn());
    checkDeprecatedConfig();
  };

  if (process.platform === 'win32') {
    // watch for changes on config every 2s on Windows
    // https://github.com/zeit/hyper/pull/1772
    _watcher = fs.watchFile(cfgPath, {interval: 2000}, (curr, prev) => {
      if (curr.mtime === 0) {
        //eslint-disable-next-line no-console
        console.error('error watching config');
      } else if (curr.mtime !== prev.mtime) {
        onChange();
      }
    });
  } else {
    _watcher = fs.watch(cfgPath);
    _watcher.on('change', onChange);
    _watcher.on('error', error => {
      //eslint-disable-next-line no-console
      console.error('error watching config', error);
    });
  }
};

exports.subscribe = fn => {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

exports.getConfigDir = () => {
  // expose config directory to load plugin from the right place
  return cfgDir;
};

exports.getConfig = () => {
  return cfg.config;
};

exports.openConfig = () => {
  return _openConfig();
};

exports.getPlugins = () => {
  return {
    plugins: cfg.plugins,
    localPlugins: cfg.localPlugins
  };
};

exports.getKeymaps = () => {
  return cfg.keymaps;
};

exports.setup = () => {
  cfg = _import();
  _watch();
  checkDeprecatedConfig();
};

exports.getWin = win.get;
exports.winRecord = win.recordState;

const getDeprecatedCSS = function(config) {
  const deprecated = [];
  const deprecatedCSS = ['x-screen', 'x-row', 'cursor-node', '::selection'];
  deprecatedCSS.forEach(css => {
    if ((config.css && config.css.indexOf(css) !== -1) || (config.termCSS && config.termCSS.indexOf(css) !== -1)) {
      deprecated.push(css);
    }
  });
  return deprecated;
};
exports.getDeprecatedCSS = getDeprecatedCSS;

const checkDeprecatedConfig = function() {
  if (!cfg.config) {
    return;
  }
  const deprecated = getDeprecatedCSS(cfg.config);
  if (deprecated.length === 0) {
    return;
  }
  const deprecatedStr = deprecated.join(', ');
  notify('Configuration warning', `Your configuration uses some deprecated CSS classes (${deprecatedStr})`);
};

exports.fixConfigDefaults = decoratedConfig => {
  const defaultConfig = getDefaultConfig().config;
  // We must have default colors for xterm css.
  decoratedConfig.colors = Object.assign({}, defaultConfig.colors, decoratedConfig.colors);
  return decoratedConfig;
};

exports.htermConfigTranslate = config => {
  const cssReplacements = {
    'x-screen x-row([ {.[])': '.xterm-rows > div$1',
    '.cursor-node([ {.[])': '.terminal-cursor$1',
    '::selection([ {.[])': '.terminal .xterm-selection div$1',
    'x-screen a([ {.[])': '.terminal a$1',
    'x-row a([ {.[])': '.terminal a$1'
  };
  Object.keys(cssReplacements).forEach(pattern => {
    const searchvalue = new RegExp(pattern, 'g');
    const newvalue = cssReplacements[pattern];
    config.css = config.css.replace(searchvalue, newvalue);
    config.termCSS = config.termCSS.replace(searchvalue, newvalue);
  });
  return config;
};
