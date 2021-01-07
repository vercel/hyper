import chokidar from 'chokidar';
import notify from './notify';
import {_import, getDefaultConfig} from './config/import';
import _openConfig from './config/open';
import win from './config/windows';
import {cfgPath, cfgDir} from './config/paths';
import {getColorMap} from './utils/colors';
import {parsedConfig, configOptions} from '../lib/config';
import {app} from 'electron';

const watchers: Function[] = [];
let cfg: parsedConfig = {} as any;
let _watcher: chokidar.FSWatcher;

export const getDeprecatedCSS = (config: configOptions) => {
  const deprecated: string[] = [];
  const deprecatedCSS = ['x-screen', 'x-row', 'cursor-node', '::selection'];
  deprecatedCSS.forEach((css) => {
    if (config.css?.includes(css) || config.termCSS?.includes(css)) {
      deprecated.push(css);
    }
  });
  return deprecated;
};

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

const _watch = () => {
  if (_watcher) {
    return;
  }

  const onChange = () => {
    // Need to wait 100ms to ensure that write is complete
    setTimeout(() => {
      cfg = _import();
      notify('Configuration updated', 'Hyper configuration reloaded!');
      watchers.forEach((fn) => fn());
      checkDeprecatedConfig();
    }, 100);
  };

  _watcher = chokidar.watch(cfgPath);
  _watcher.on('change', onChange);
  _watcher.on('error', (error) => {
    console.error('error watching config', error);
  });

  app.on('before-quit', (e) => {
    if (Object.keys(_watcher.getWatched()).length > 0) {
      e.preventDefault();
      _watcher.close().then(() => {
        app.quit();
      });
    }
  });
};

export const subscribe = (fn: Function) => {
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

export const getPlugins = (): {plugins: string[]; localPlugins: string[]} => {
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

export const fixConfigDefaults = (decoratedConfig: configOptions) => {
  const defaultConfig = getDefaultConfig().config!;
  decoratedConfig.colors = getColorMap(decoratedConfig.colors) || {};
  // We must have default colors for xterm css.
  decoratedConfig.colors = {...defaultConfig.colors, ...decoratedConfig.colors};
  return decoratedConfig;
};

export const htermConfigTranslate = (config: configOptions) => {
  const cssReplacements: Record<string, string> = {
    'x-screen x-row([ {.[])': '.xterm-rows > div$1',
    '.cursor-node([ {.[])': '.terminal-cursor$1',
    '::selection([ {.[])': '.terminal .xterm-selection div$1',
    'x-screen a([ {.[])': '.terminal a$1',
    'x-row a([ {.[])': '.terminal a$1'
  };
  Object.keys(cssReplacements).forEach((pattern) => {
    const searchvalue = new RegExp(pattern, 'g');
    const newvalue = cssReplacements[pattern];
    config.css = config.css?.replace(searchvalue, newvalue);
    config.termCSS = config.termCSS?.replace(searchvalue, newvalue);
  });
  return config;
};
