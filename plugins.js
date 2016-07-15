const { app, dialog } = require('electron');
const { homedir } = require('os');
const { resolve, basename } = require('path');
const { writeFileSync } = require('fs');
const config = require('./config');
const { sync: mkdirpSync } = require('mkdirp');
const { exec } = require('child_process');
const Config = require('electron-config');
const ms = require('ms');
const notify = require('./notify');

// local storage
const cache = new Config();

// modules path
const path = resolve(homedir(), '.hyperterm_plugins');
const localPath = resolve(homedir(), '.hyperterm_plugins', 'local');

// init plugin directories if not present
mkdirpSync(path);
mkdirpSync(localPath);

// caches
let plugins = config.getPlugins();
let paths = getPaths(plugins);
let id = getId(plugins);
let modules = requirePlugins();

function getId (plugins_) {
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

function updatePlugins ({ force = false } = {}) {
  if (updating) return notify('Plugin update in progress');
  updating = true;
  syncPackageJSON();
  const id_ = id;
  install((err) => {
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
          'Check `~/.hyperterm_plugins/npm-debug.log` for more information.'
        );
      }
    } else {
      // flag successful plugin update
      cache.set('plugins', id_);

      // cache paths
      paths = getPaths(plugins);

      // clear require cache
      clearCache();

      // cache modules
      modules = requirePlugins();

      const loaded = modules.length;
      const total = paths.plugins.length + paths.localPlugins.length;
      const pluginVersions = JSON.stringify(getPluginVersions());
      const changed = cache.get('plugin-versions') !== pluginVersions && loaded === total;
      cache.set('plugin-versions', pluginVersions);

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
        watchers.forEach((fn) => fn(err, { force }));
      }
    }
  });
}

function getPluginVersions () {
  const paths_ = paths.plugins.concat(paths.localPlugins);
  return paths_.map((path) => {
    let version = null;
    try {
      version = require(resolve(path, 'package.json')).version;
    } catch (err) { }
    return [
      basename(path),
      version
    ];
  });
}

function clearCache (mod) {
  // trigger unload hooks
  modules.forEach((mod) => {
    if (mod.onUnload) mod.onUnload(app);
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
if (cache.get('plugins') !== id || process.env.HYPERTERM_FORCE_UPDATE) {
  // install immediately if the user changed plugins
  console.log('plugins have changed / not init, scheduling plugins installation');
  setTimeout(() => {
    updatePlugins();
  }, 5000);
}

// otherwise update plugins every 5 hours
setInterval(updatePlugins, ms('5h'));

function syncPackageJSON () {
  const dependencies = toDependencies(plugins);
  const pkg = {
    name: 'hyperterm-plugins',
    description: 'Auto-generated from `~/.hyperterm.js`!',
    private: true,
    version: '0.0.1',
    repository: 'zeit/hyperterm',
    license: 'MIT',
    homepage: 'https://hyperterm.org',
    dependencies
  };

  const file = resolve(path, 'package.json');
  try {
    writeFileSync(file, JSON.stringify(pkg, null, 2));
  } catch (err) {
    alert(`An error occurred writing to ${file}`);
  }
}

function alert (message) {
  dialog.showMessageBox({
    message,
    buttons: ['Ok']
  });
}

function toDependencies (plugins) {
  const obj = {};
  plugins.plugins.forEach((plugin) => {
    const pieces = plugin.split('#');
    obj[pieces[0]] = null == pieces[1] ? 'latest' : pieces[1];
  });
  return obj;
}

function install (fn) {
  const prefix = 'darwin' === process.platform ? 'eval `/usr/libexec/path_helper -s` && ' : '';
  exec(prefix + 'npm prune && npm install --production', {
    cwd: path
  }, (err, stdout, stderr) => {
    if (err) return fn(err);
    fn(null);
  });
}

exports.subscribe = function (fn) {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

function getPaths () {
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
exports.getPaths = getPaths;

// get paths from renderer
exports.getBasePaths = function () {
  return { path, localPath };
};

function requirePlugins () {
  const { plugins, localPlugins } = paths;

  const load = (path) => {
    let mod;
    try {
      mod = require(path);

      if (!mod || (!mod.onApp && !mod.onWindow && !mod.onUnload &&
        !mod.middleware &&
        !mod.decorateConfig && !mod.decorateMenu &&
        !mod.decorateTerm && !mod.decorateHyperTerm &&
        !mod.decorateTab && !mod.decorateNotification &&
        !mod.decorateNotifications && !mod.decorateTabs &&
        !mod.decorateConfig)) {
        notify('Plugin error!', `Plugin "${basename(path)}" does not expose any ` +
          'HyperTerm extension API methods');
        return;
      }
      return mod;
    } catch (err) {
      notify('Plugin error!', `Plugin "${basename(path)}" failed to load (${err.message})`);
    }
  };

  return plugins.map(load)
    .concat(localPlugins.map(load))
    .filter(v => !!v);
}

exports.onApp = function (app) {
  modules.forEach((plugin) => {
    if (plugin.onApp) {
      plugin.onApp(app);
    }
  });
};

exports.onWindow = function (win, app) {
  modules.forEach((plugin) => {
    if (plugin.onWindow) {
      plugin.onWindow(app);
    }
  });
};

exports.decorateMenu = function (tpl) {
  let decorated = tpl;
  modules.forEach((plugin) => {
    if (plugin.decorateMenu) {
      const res = plugin.decorateMenu(decorated);
      if (res) {
        decorated = res;
      } else {
        console.error('incompatible response type for `decorateMenu`');
      }
    }
  });
  return decorated;
};

exports.decorateConfig = function (config) {
  let decorated = config;
  modules.forEach((plugin) => {
    if (plugin.decorateConfig) {
      const res = plugin.decorateConfig(decorated);
      if (res) {
        decorated = res;
      } else {
        console.error('incompatible response type for `decorateConfig`');
      }
    }
  });
  return decorated;
};
