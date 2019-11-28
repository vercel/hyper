import fs from 'fs';
import notify from './notify';
import {_import, getDefaultConfig} from './config/import';
import _openConfig from './config/open';
import win from './config/windows';
import {cfgPath, cfgDir} from './config/paths';
import {getColorMap} from './utils/colors';

const watchers = [];
let cfg = {};
let _watcher;

const _watch = () => {
  if (_watcher) {
    return _watcher;
  }

  const onChange = () => {
    // Need to wait 100ms to ensure that write is complete
    setTimeout(() => {
      cfg = _import();
      notify('Configuration updated', 'Hyper configuration reloaded!');
      watchers.forEach(fn => fn());
      checkDeprecatedConfig();
    }, 100);
  };

  // Windows
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
    return;
  }
  // macOS/Linux
  setWatcher();
  function setWatcher() {
    try {
      _watcher = fs.watch(cfgPath, eventType => {
        if (eventType === 'rename') {
          _watcher.close();
          // Ensure that new file has been written
          setTimeout(() => setWatcher(), 500);
        }
      });
    } catch (e) {
      //eslint-disable-next-line no-console
      console.error('Failed to watch config file:', cfgPath, e);
      return;
    }
    _watcher.on('change', onChange);
    _watcher.on('error', error => {
      //eslint-disable-next-line no-console
      console.error('error watching config', error);
    });
  }
};

export const subscribe = fn => {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

export const getConfigDir = () => {
  // expose config directory to load plugin from the right place
  return cfgDir;
};

export const getConfig = () => {
  return cfg.config;
};

export const openConfig = () => {
  return _openConfig();
};

export const getPlugins = () => {
  return {
    plugins: cfg.plugins,
    localPlugins: cfg.localPlugins
  };
};

export const getKeymaps = () => {
  return cfg.keymaps;
};

export const setup = () => {
  cfg = _import();
  _watch();
  checkDeprecatedConfig();
};

export const getWin = win.get;
export const winRecord = win.recordState;
export const windowDefaults = win.defaults;

const getDeprecatedCSS = config => {
  const deprecated = [];
  const deprecatedCSS = ['x-screen', 'x-row', 'cursor-node', '::selection'];
  deprecatedCSS.forEach(css => {
    if ((config.css && config.css.includes(css)) || (config.termCSS && config.termCSS.includes(css))) {
      deprecated.push(css);
    }
  });
  return deprecated;
};
export {getDeprecatedCSS};

const checkDeprecatedConfig = () => {
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

export const fixConfigDefaults = decoratedConfig => {
  const defaultConfig = getDefaultConfig().config;
  decoratedConfig.colors = getColorMap(decoratedConfig.colors) || {};
  // We must have default colors for xterm css.
  decoratedConfig.colors = Object.assign({}, defaultConfig.colors, decoratedConfig.colors);
  return decoratedConfig;
};

export const htermConfigTranslate = config => {
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
    config.css = config.css && config.css.replace(searchvalue, newvalue);
    config.termCSS = config.termCSS && config.termCSS.replace(searchvalue, newvalue);
  });
  return config;
};
