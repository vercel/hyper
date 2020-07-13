import {app, dialog, BrowserWindow, App} from 'electron';
import {resolve, basename} from 'path';
import {writeFileSync} from 'fs';
import Config from 'electron-store';
import ms from 'ms';
import React from 'react';
import ReactDom from 'react-dom';
import * as config from './config';
import notify from './notify';
import {availableExtensions} from './plugins/extensions';
import {install} from './plugins/install';
import {plugs} from './config/paths';
import mapKeys from './utils/map-keys';
import {configOptions} from '../lib/config';

// local storage
const cache = new Config();

const path = plugs.base;
const localPath = plugs.local;

patchModuleLoad();

// caches
let plugins = config.getPlugins();
let paths = getPaths();
let id = getId(plugins);
let modules = requirePlugins();

function getId(plugins_: any) {
  return JSON.stringify(plugins_);
}

const watchers: Function[] = [];

// we listen on configuration updates to trigger
// plugin installation
config.subscribe(() => {
  const plugins_ = config.getPlugins();
  if (plugins !== plugins_) {
    const id_ = getId(plugins_);
    if (id !== id_) {
      id = id_;
      plugins = plugins_;
      updatePlugins();
    }
  }
});

// patching Module._load
// so plugins can `require` them without needing their own version
// https://github.com/vercel/hyper/issues/619
function patchModuleLoad() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Module = require('module');
  const originalLoad = Module._load;
  Module._load = function _load(modulePath: string) {
    // PLEASE NOTE: Code changes here, also need to be changed in
    // lib/utils/plugins.js
    switch (modulePath) {
      case 'react':
        // DEPRECATED
        return React;
      case 'react-dom':
        // DEPRECATED
        return ReactDom;
      case 'hyper/component':
        // DEPRECATED
        return React.PureComponent;
      // These return Object, since they work differently on the backend, than on the frontend.
      // Still needs to be here, to prevent errors, while loading plugins.
      case 'hyper/Notification':
      case 'hyper/notify':
      case 'hyper/decorate':
        return Object;
      default:
        // eslint-disable-next-line prefer-rest-params
        return originalLoad.apply(this, arguments);
    }
  };
}

function checkDeprecatedExtendKeymaps() {
  modules.forEach((plugin) => {
    if (plugin.extendKeymaps) {
      notify('Plugin warning!', `"${plugin._name}" use deprecated "extendKeymaps" handler`);
      return;
    }
  });
}

let updating = false;

function updatePlugins({force = false} = {}) {
  if (updating) {
    return notify('Plugin update in progress');
  }
  updating = true;
  syncPackageJSON();
  const id_ = id;
  install((err: any) => {
    updating = false;

    if (err) {
      notify('Error updating plugins.', err, {error: err});
    } else {
      // flag successful plugin update
      cache.set('hyper.plugins', id_);

      // cache paths
      paths = getPaths();

      // clear require cache
      clearCache();

      // cache modules
      modules = requirePlugins();

      const loaded = modules.length;
      const total = paths.plugins.length + paths.localPlugins.length;
      const pluginVersions = JSON.stringify(getPluginVersions());
      const changed = cache.get('hyper.plugin-versions') !== pluginVersions && loaded === total;
      cache.set('hyper.plugin-versions', pluginVersions);

      // notify watchers
      watchers.forEach((fn) => fn(err, {force}));

      if (force || changed) {
        if (changed) {
          notify('Plugins Updated', 'Restart the app or hot-reload with "View" > "Reload" to enjoy the updates!');
        } else {
          notify('Plugins Updated', 'No changes!');
        }
        checkDeprecatedExtendKeymaps();
      }
    }
  });
}

function getPluginVersions() {
  const paths_ = paths.plugins.concat(paths.localPlugins);
  return paths_.map((path_) => {
    let version = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      version = require(resolve(path_, 'package.json')).version;
      //eslint-disable-next-line no-empty
    } catch (err) {}
    return [basename(path_), version];
  });
}

function clearCache() {
  // trigger unload hooks
  modules.forEach((mod) => {
    if (mod.onUnload) {
      mod.onUnload(app);
    }
  });

  // clear require cache
  for (const entry in require.cache) {
    if (entry.indexOf(path) === 0 || entry.indexOf(localPath) === 0) {
      delete require.cache[entry];
    }
  }
}

export {updatePlugins};

export const getLoadedPluginVersions = () => {
  return modules.map((mod) => ({name: mod._name, version: mod._version}));
};

// we schedule the initial plugins update
// a bit after the user launches the terminal
// to prevent slowness
if (cache.get('hyper.plugins') !== id || process.env.HYPER_FORCE_UPDATE) {
  // install immediately if the user changed plugins
  console.log('plugins have changed / not init, scheduling plugins installation');
  setTimeout(() => {
    updatePlugins();
  }, 1000);
}

(() => {
  const baseConfig = config.getConfig();
  if (baseConfig['autoUpdatePlugins']) {
    // otherwise update plugins every 5 hours
    setInterval(updatePlugins, ms(baseConfig['autoUpdatePlugins'] === true ? '5h' : baseConfig['autoUpdatePlugins']));
  }
})();

function syncPackageJSON() {
  const dependencies = toDependencies(plugins);
  const pkg = {
    name: 'hyper-plugins',
    description: 'Auto-generated from `~/.hyper.js`!',
    private: true,
    version: '0.0.1',
    repository: 'vercel/hyper',
    license: 'MIT',
    homepage: 'https://hyper.is',
    dependencies
  };

  const file = resolve(path, 'package.json');
  try {
    writeFileSync(file, JSON.stringify(pkg, null, 2));
  } catch (err) {
    alert(`An error occurred writing to ${file}`);
  }
}

function alert(message: string) {
  dialog.showMessageBox({
    message,
    buttons: ['Ok']
  });
}

function toDependencies(plugins_: {plugins: string[]}) {
  const obj: Record<string, string> = {};
  plugins_.plugins.forEach((plugin) => {
    const regex = /.(@|#)/;
    const match = regex.exec(plugin);

    if (match) {
      const index = match.index + 1;
      const pieces = [];

      pieces[0] = plugin.substring(0, index);
      pieces[1] = plugin.substring(index + 1, plugin.length);
      obj[pieces[0]] = pieces[1];
    } else {
      obj[plugin] = 'latest';
    }
  });
  return obj;
}

export const subscribe = (fn: Function) => {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

function getPaths() {
  return {
    plugins: plugins.plugins.map((name) => {
      return resolve(path, 'node_modules', name.split('#')[0]);
    }),
    localPlugins: plugins.localPlugins.map((name) => {
      return resolve(localPath, name);
    })
  };
}

// expose to renderer
export {getPaths};

// get paths from renderer
export const getBasePaths = () => {
  return {path, localPath};
};

function requirePlugins(): any[] {
  const {plugins: plugins_, localPlugins} = paths;

  const load = (path_: string) => {
    let mod: any;
    try {
      mod = require(path_);
      const exposed = mod && Object.keys(mod).some((key) => availableExtensions.has(key));
      if (!exposed) {
        notify('Plugin error!', `${`Plugin "${basename(path_)}" does not expose any `}Hyper extension API methods`);
        return;
      }

      // populate the name for internal errors here
      mod._name = basename(path_);
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        mod._version = require(resolve(path_, 'package.json')).version;
      } catch (err) {
        console.warn(`No package.json found in ${path_}`);
      }
      console.log(`Plugin ${mod._name} (${mod._version}) loaded.`);

      return mod;
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        console.warn(`Plugin error while loading "${basename(path_)}" (${path_}): ${err.message}`);
      } else {
        notify('Plugin error!', `Plugin "${basename(path_)}" failed to load (${err.message})`, {error: err});
      }
    }
  };

  return plugins_
    .map(load)
    .concat(localPlugins.map(load))
    .filter((v) => Boolean(v));
}

export const onApp = (app_: App) => {
  modules.forEach((plugin) => {
    if (plugin.onApp) {
      try {
        plugin.onApp(app_);
      } catch (e) {
        notify('Plugin error!', `"${plugin._name}" has encountered an error. Check Developer Tools for details.`, {
          error: e
        });
      }
    }
  });
};

export const onWindowClass = (win: BrowserWindow) => {
  modules.forEach((plugin) => {
    if (plugin.onWindowClass) {
      try {
        plugin.onWindowClass(win);
      } catch (e) {
        notify('Plugin error!', `"${plugin._name}" has encountered an error. Check Developer Tools for details.`, {
          error: e
        });
      }
    }
  });
};

export const onWindow = (win: BrowserWindow) => {
  modules.forEach((plugin) => {
    if (plugin.onWindow) {
      try {
        plugin.onWindow(win);
      } catch (e) {
        notify('Plugin error!', `"${plugin._name}" has encountered an error. Check Developer Tools for details.`, {
          error: e
        });
      }
    }
  });
};

// decorates the base entity by calling plugin[key]
// for all the available plugins
function decorateEntity(base: any, key: string, type: 'object' | 'function') {
  let decorated = base;
  modules.forEach((plugin) => {
    if (plugin[key]) {
      let res;
      try {
        res = plugin[key](decorated);
      } catch (e) {
        notify('Plugin error!', `"${plugin._name}" when decorating ${key}`, {error: e});
        return;
      }
      if (res && (!type || typeof res === type)) {
        decorated = res;
      } else {
        notify('Plugin error!', `"${plugin._name}": invalid return type for \`${key}\``);
      }
    }
  });

  return decorated;
}

function decorateObject<T>(base: T, key: string): T {
  return decorateEntity(base, key, 'object');
}

function decorateClass(base: any, key: string) {
  return decorateEntity(base, key, 'function');
}

export const getDeprecatedConfig = () => {
  const deprecated: Record<string, {css: string[]}> = {};
  const baseConfig = config.getConfig();
  modules.forEach((plugin) => {
    if (!plugin.decorateConfig) {
      return;
    }
    // We need to clone config in case of plugin modifies config directly.
    let configTmp: configOptions;
    try {
      configTmp = plugin.decorateConfig(JSON.parse(JSON.stringify(baseConfig)));
    } catch (e) {
      notify('Plugin error!', `"${plugin._name}" has encountered an error. Check Developer Tools for details.`, {
        error: e
      });
      return;
    }
    const pluginCSSDeprecated = config.getDeprecatedCSS(configTmp);
    if (pluginCSSDeprecated.length === 0) {
      return;
    }
    deprecated[plugin._name] = {css: pluginCSSDeprecated};
  });
  return deprecated;
};

export const decorateMenu = (tpl: any) => {
  return decorateObject(tpl, 'decorateMenu');
};

export const getDecoratedEnv = (baseEnv: Record<string, string>) => {
  return decorateObject(baseEnv, 'decorateEnv');
};

export const getDecoratedConfig = () => {
  const baseConfig = config.getConfig();
  const decoratedConfig = decorateObject(baseConfig, 'decorateConfig');
  const fixedConfig = config.fixConfigDefaults(decoratedConfig);
  const translatedConfig = config.htermConfigTranslate(fixedConfig);
  return translatedConfig;
};

export const getDecoratedKeymaps = () => {
  const baseKeymaps = config.getKeymaps();
  // Ensure that all keys are in an array and don't use deprecated key combination`
  const decoratedKeymaps = mapKeys(decorateObject(baseKeymaps, 'decorateKeymaps'));
  return decoratedKeymaps;
};

export const getDecoratedBrowserOptions = <T>(defaults: T): T => {
  return decorateObject(defaults, 'decorateBrowserOptions');
};

export const decorateWindowClass = <T>(defaults: T): T => {
  return decorateObject(defaults, 'decorateWindowClass');
};

export const decorateSessionOptions = <T>(defaults: T): T => {
  return decorateObject(defaults, 'decorateSessionOptions');
};

export const decorateSessionClass = <T>(Session: T): T => {
  return decorateClass(Session, 'decorateSessionClass');
};

export {toDependencies as _toDependencies};
