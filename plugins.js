const { dialog } = require('electron');
const { homedir } = require('os');
const { resolve, basename } = require('path');
const { writeFileSync } = require('fs');
const config = require('./config');
const { sync: mkdirpSync } = require('mkdirp');
const { exec } = require('child_process');
const Config = require('electron-config');
const ms = require('ms');
const which = require('which');
const notify = require('./notify');

// local storage
const cache = new Config();

// modules path
const path = resolve(homedir(), '.hyperterm_modules');
const localPath = resolve(homedir(), '.hyperterm_local_modules');

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
      notify(
        'Error updating plugins.',
        'Check `~/.hyperterm_modules/npm-debug.log` for more information.'
      );
    } else {
      // flag successful plugin update
      cache.set('plugins', id_);

      // cache paths
      paths = getPaths(plugins);

      // clear require cache
      paths.plugins.forEach(clearCache);
      paths.localPlugins.forEach(clearCache);

      // cache modules
      modules = requirePlugins();

      // notify watchers
      watchers.forEach((fn) => fn(err));

      const loaded = modules.length;
      const total = paths.plugins.length + paths.localPlugins.length;
      const pluginVersions = JSON.stringify(getPluginVersions());
      if (force || (cache.get('plugin-versions') !== pluginVersions && loaded === total)) {
        notify('HyperTerm plugins updated!');
      }
      cache.set('plugin-versions', pluginVersions);
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
  for (const entry in require.cache) {
    if (0 === entry.indexOf(mod + '/')) {
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
  exec('npm prune && npm install --production', {
    cwd: path
  }, (err, stdout, stderr) => {
    if (err) {
      if (/(command not found|not recognized as an)/.test(err.stack)) {
        if (plugins.plugins.length) {
          alert('We found `plugins` in `.hyperterm.js`, but `npm` is ' +
            'not installed or not in $PATH!\nPlease head to ' +
            'https://nodejs.org and install the Node.js runtime.');
        } else {
          console.log('npm not found, but no plugins defined');
        }
      }
      return fn(err);
    }
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
      return resolve(path, 'node_modules', name);
    }),
    localPlugins: plugins.localPlugins.map((name) => {
      return resolve(localPath, name);
    })
  };
}

exports.getPaths = getPaths;

function requirePlugins () {
  const { plugins, localPlugins } = paths;

  const load = (path) => {
    let mod;
    try {
      mod = require(path);

      if (!mod || (!mod.onApp && !mod.onWindow && !mod.onUnload &&
        !mod.decorateConfig && !mod.decorateMenu &&
        !mod.decorateTerm && !mod.decorateHyperTerm &&
        !mod.decorateTabs && !mod.decorateConfig)) {
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

exports.decorateTerm = function (Term) {
  return Term;
};

exports.decorateTabs = function (Tabs) {
  return Tabs;
};

exports.decorateHyperTerm = function (HyperTerm) {
  return HyperTerm;
};

exports.decorateMenu = function (tpl) {
  return tpl;
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
