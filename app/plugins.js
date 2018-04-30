const {app, dialog} = require('electron');
const {resolve, basename} = require('path');
const {writeFileSync} = require('fs');
const Config = require('electron-config');
const ms = require('ms');

const config = require('./config');
const notify = require('./notify');
const {availableExtensions} = require('./plugins/extensions');
const {install} = require('./plugins/install');
const {plugs} = require('./config/paths');
const mapKeys = require('./utils/map-keys');

// local storage
const cache = new Config();

const path = plugs.base;
const localPath = plugs.local;

// caches
let plugins = config.getPlugins();
let paths = getPaths();
let id = getId(plugins);
let modules = requirePlugins();

function getId(plugins_) {
  return JSON.stringify(plugins_);
}

const watchers = [];

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

function checkDeprecatedExtendKeymaps() {
  modules.forEach(plugin => {
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
  install(err => {
    updating = false;

    if (err) {
      //eslint-disable-next-line no-console
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
      watchers.forEach(fn => fn(err, {force}));

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
  return paths_.map(path_ => {
    let version = null;
    try {
      //eslint-disable-next-line import/no-dynamic-require
      version = require(resolve(path_, 'package.json')).version;
      //eslint-disable-next-line no-empty
    } catch (err) {}
    return [basename(path_), version];
  });
}

function clearCache() {
  // trigger unload hooks
  modules.forEach(mod => {
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

exports.updatePlugins = updatePlugins;

exports.getLoadedPluginVersions = () => {
  return modules.map(mod => ({name: mod._name, version: mod._version}));
};

// we schedule the initial plugins update
// a bit after the user launches the terminal
// to prevent slowness
if (cache.get('hyper.plugins') !== id || process.env.HYPER_FORCE_UPDATE) {
  // install immediately if the user changed plugins
  //eslint-disable-next-line no-console
  console.log('plugins have changed / not init, scheduling plugins installation');
  setTimeout(() => {
    updatePlugins();
  }, 1000);
}

// otherwise update plugins every 5 hours
setInterval(updatePlugins, ms('5h'));

function syncPackageJSON() {
  const dependencies = toDependencies(plugins);
  const pkg = {
    name: 'hyper-plugins',
    description: 'Auto-generated from `~/.hyper.js`!',
    private: true,
    version: '0.0.1',
    repository: 'zeit/hyper',
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

function alert(message) {
  dialog.showMessageBox({
    message,
    buttons: ['Ok']
  });
}

function toDependencies(plugins_) {
  const obj = {};
  plugins_.plugins.forEach(plugin => {
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

exports.subscribe = fn => {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

function getPaths() {
  return {
    plugins: plugins.plugins.map(name => {
      return resolve(path, 'node_modules', name.split('#')[0].split('@')[0]);
    }),
    localPlugins: plugins.localPlugins.map(name => {
      return resolve(localPath, name);
    })
  };
}

// expose to renderer
exports.getPaths = getPaths;

// get paths from renderer
exports.getBasePaths = () => {
  return {path, localPath};
};

function requirePlugins() {
  const {plugins: plugins_, localPlugins} = paths;

  const load = path_ => {
    let mod;
    try {
      // eslint-disable-next-line import/no-dynamic-require
      mod = require(path_);
      const exposed = mod && Object.keys(mod).some(key => availableExtensions.has(key));
      if (!exposed) {
        notify('Plugin error!', `Plugin "${basename(path_)}" does not expose any ` + 'Hyper extension API methods');
        return;
      }

      // populate the name for internal errors here
      mod._name = basename(path_);
      try {
        // eslint-disable-next-line import/no-dynamic-require
        mod._version = require(resolve(path_, 'package.json')).version;
      } catch (err) {
        //eslint-disable-next-line no-console
        console.warn(`No package.json found in ${path_}`);
      }
      //eslint-disable-next-line no-console
      console.log(`Plugin ${mod._name} (${mod._version}) loaded.`);

      return mod;
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        //eslint-disable-next-line no-console
        console.warn(`Plugin "${basename(path_)}" not found: ${path_}`);
      } else {
        notify('Plugin error!', `Plugin "${basename(path_)}" failed to load (${err.message})`, {error: err});
      }
    }
  };

  return plugins_
    .map(load)
    .concat(localPlugins.map(load))
    .filter(v => Boolean(v));
}

exports.onApp = app_ => {
  modules.forEach(plugin => {
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

exports.onWindow = win => {
  modules.forEach(plugin => {
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

// decorates the base object by calling plugin[key]
// for all the available plugins
function decorateObject(base, key) {
  let decorated = base;
  modules.forEach(plugin => {
    if (plugin[key]) {
      let res;
      try {
        res = plugin[key](decorated);
      } catch (e) {
        notify('Plugin error!', `"${plugin._name}" when decorating ${key}`, {error: e});
        return;
      }
      if (res && typeof res === 'object') {
        decorated = res;
      } else {
        notify('Plugin error!', `"${plugin._name}": invalid return type for \`${key}\``);
      }
    }
  });

  return decorated;
}

exports.getDeprecatedConfig = () => {
  const deprecated = {};
  const baseConfig = config.getConfig();
  modules.forEach(plugin => {
    if (!plugin.decorateConfig) {
      return;
    }
    // We need to clone config in case of plugin modifies config directly.
    let configTmp;
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

exports.decorateMenu = tpl => {
  return decorateObject(tpl, 'decorateMenu');
};

exports.getDecoratedEnv = baseEnv => {
  return decorateObject(baseEnv, 'decorateEnv');
};

exports.getDecoratedConfig = () => {
  const baseConfig = config.getConfig();
  const decoratedConfig = decorateObject(baseConfig, 'decorateConfig');
  const fixedConfig = config.fixConfigDefaults(decoratedConfig);
  const translatedConfig = config.htermConfigTranslate(fixedConfig);
  return translatedConfig;
};

exports.getDecoratedKeymaps = () => {
  const baseKeymaps = config.getKeymaps();
  // Ensure that all keys are in an array and don't use deprecated key combination`
  const decoratedKeymaps = mapKeys(decorateObject(baseKeymaps, 'decorateKeymaps'));
  return decoratedKeymaps;
};

exports.getDecoratedBrowserOptions = defaults => {
  return decorateObject(defaults, 'decorateBrowserOptions');
};

exports._toDependencies = toDependencies;
