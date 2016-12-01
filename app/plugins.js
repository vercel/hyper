const {exec} = require('child_process');
const {homedir} = require('os');
const {resolve, basename} = require('path');
const {writeFileSync} = require('fs');

const {app, dialog} = require('electron');
const {sync: mkdirpSync} = require('mkdirp');
const Config = require('electron-config');
const ms = require('ms');
const shellEnv = require('shell-env');

const config = require('./config');
const notify = require('./notify');

// local storage
const cache = new Config();

// modules path
const path = resolve(homedir(), '.hyper_plugins');
const localPath = resolve(homedir(), '.hyper_plugins', 'local');
const availableExtensions = new Set([
  'onApp', 'onWindow', 'onRendererWindow', 'onUnload', 'middleware',
  'reduceUI', 'reduceSessions', 'reduceTermGroups',
  'decorateMenu', 'decorateTerm', 'decorateHyper',
  'decorateHyperTerm', // for backwards compatibility with hyperterm
  'decorateTab',
  'decorateNotification', 'decorateNotifications',
  'decorateTabs', 'decorateConfig', 'decorateEnv',
  'decorateTermGroup', 'getTermProps',
  'getTabProps', 'getTabsProps', 'getTermGroupProps',
  'mapHyperTermState', 'mapTermsState',
  'mapHeaderState', 'mapNotificationsState',
  'mapHyperTermDispatch', 'mapTermsDispatch',
  'mapHeaderDispatch', 'mapNotificationsDispatch'
]);

// init plugin directories if not present
mkdirpSync(path);
mkdirpSync(localPath);

// caches
let plugins = config.getPlugins();
let paths = getPaths(plugins);
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
      console.error(err.stack);
      if (/not a recognized/.test(err.message) || /command not found/.test(err.message)) {
        notify(
          'Error updating plugins.',
          'We could not find the `npm` command. Make sure it\'s in $PATH'
        );
      } else {
        notify(
          'Error updating plugins.',
          'Check `~/.hyper_plugins/npm-debug.log` for more information.'
        );
      }
    } else {
      // flag successful plugin update
      cache.set('hyper.plugins', id_);

      // cache paths
      paths = getPaths(plugins);

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
      if (force || changed) {
        if (changed) {
          notify(
            'Plugins Updated',
            'Restart the app or hot-reload with "View" > "Reload" to enjoy the updates!'
          );
        } else {
          notify(
            'Plugins Updated',
            'No changes!'
          );
        }
        watchers.forEach(fn => fn(err, {force}));
      }
    }
  });
}

function getPluginVersions() {
  const paths_ = paths.plugins.concat(paths.localPlugins);
  return paths_.map(path => {
    let version = null;
    try {
      // eslint-disable-next-line import/no-dynamic-require
      version = require(resolve(path, 'package.json')).version;
    } catch (err) { }
    return [
      basename(path),
      version
    ];
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

// we schedule the initial plugins update
// a bit after the user launches the terminal
// to prevent slowness
if (cache.get('hyper.plugins') !== id || process.env.HYPER_FORCE_UPDATE) {
  // install immediately if the user changed plugins
  console.log('plugins have changed / not init, scheduling plugins installation');
  setTimeout(() => {
    updatePlugins();
  }, 5000);
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

function toDependencies(plugins) {
  const obj = {};
  plugins.plugins.forEach(plugin => {
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

function install(fn) {
  const {shell: cfgShell, npmRegistry} = exports.getDecoratedConfig();

  const shell = cfgShell && cfgShell !== '' ? cfgShell : undefined;

  shellEnv(shell).then(env => {
    if (npmRegistry) {
      env.NPM_CONFIG_REGISTRY = npmRegistry;
    }
    /* eslint-disable camelcase  */
    env.npm_config_runtime = 'electron';
    env.npm_config_target = process.versions.electron;
    env.npm_config_disturl = 'https://atom.io/download/atom-shell';
    /* eslint-enable camelcase  */
    exec('npm prune && npm install --production', {
      cwd: path,
      env,
      shell
    }, err => {
      if (err) {
        return fn(err);
      }
      fn(null);
    });
  }).catch(fn);
}

exports.subscribe = function (fn) {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

function getPaths() {
  return {
    plugins: plugins.plugins.map(name => {
      return resolve(path, 'node_modules', name.split('#')[0]);
    }),
    localPlugins: plugins.localPlugins.map(name => {
      return resolve(localPath, name);
    })
  };
}

// expose to renderer
exports.getPaths = getPaths;

// get paths from renderer
exports.getBasePaths = function () {
  return {path, localPath};
};

function requirePlugins() {
  const {plugins, localPlugins} = paths;

  const load = path => {
    let mod;
    try {
      // eslint-disable-next-line import/no-dynamic-require
      mod = require(path);
      const exposed = mod && Object.keys(mod).some(key => availableExtensions.has(key));
      if (!exposed) {
        notify('Plugin error!', `Plugin "${basename(path)}" does not expose any ` +
          'Hyper extension API methods');
        return;
      }

      // populate the name for internal errors here
      mod._name = basename(path);

      return mod;
    } catch (err) {
      console.error(err);
      notify('Plugin error!', `Plugin "${basename(path)}" failed to load (${err.message})`);
    }
  };

  return plugins.map(load)
    .concat(localPlugins.map(load))
    .filter(v => Boolean(v));
}

exports.onApp = function (app) {
  modules.forEach(plugin => {
    if (plugin.onApp) {
      plugin.onApp(app);
    }
  });
};

exports.onWindow = function (win) {
  modules.forEach(plugin => {
    if (plugin.onWindow) {
      plugin.onWindow(win);
    }
  });
};

// decorates the base object by calling plugin[key]
// for all the available plugins
function decorateObject(base, key) {
  let decorated = base;
  modules.forEach(plugin => {
    if (plugin[key]) {
      const res = plugin[key](decorated);
      if (res && typeof res === 'object') {
        decorated = res;
      } else {
        notify('Plugin error!', `"${plugin._name}": invalid return type for \`${key}\``);
      }
    }
  });

  return decorated;
}

exports.decorateMenu = function (tpl) {
  return decorateObject(tpl, 'decorateMenu');
};

exports.getDecoratedEnv = function (baseEnv) {
  return decorateObject(baseEnv, 'decorateEnv');
};

exports.getDecoratedConfig = function () {
  const baseConfig = config.getConfig();
  return decorateObject(baseConfig, 'decorateConfig');
};

exports.getDecoratedBrowserOptions = function (defaults) {
  return decorateObject(defaults, 'decorateBrowserOptions');
};

exports._toDependencies = toDependencies;
