const path = require('path');
const Config = require('electron-config');
const config = require('../config');
const {pluginsPath, localPluginsPath, pkgPath} = require('../config/paths');
const notify = require('../notify');
const install = require('./install');
const extensions = require('./extensions');

const cache = new Config();
let _plugins;
let _id;
let updating = false;

const _getPaths = function () {
  const paths = {
    plugins: _plugins.plugins.map(name => {
      return path.join(pluginsPath, 'node_modules', name.split('#')[0]);
    }),
    localPlugins: _plugins.localPlugins.map(name => {
      return path.join(localPluginsPath, name);
    })
  };
  return paths;
};

const _getPluginVersions = function (paths) {
  const paths_ = paths.plugins.concat(localPluginsPath);
  return paths_.map(pluginPath => {
    let version = null;
    try {
      // eslint-disable-next-line import/no-dynamic-require
      version = require(pkgPath).version;
    } catch (err) { }
    return [
      path.basename(pluginPath),
      version
    ];
  });
};

function _requirePlugins(paths, fn) {
  const {plugins, localPlugins} = paths;
  const load = plugin => {
    let mod;
    try {
      // eslint-disable-next-line import/no-dynamic-require
      mod = require(plugin);
      const exposed = mod && Object.keys(mod).some(key => extensions.has(key));
      if (!exposed) {
        notify('Plugin error!', `Plugin "${path.basename(plugin)}" does not expose any ` +
        'Hyper extension API methods');
        return;
      }

      // populate the name for internal errors here
      mod._name = path.basename(plugin);

      return mod;
    } catch (err) {
      fn();
    }
  };

  return plugins.map(load)
    .concat(localPlugins.map(load))
    .filter(v => Boolean(v));
}

function init(fn) {
  if (updating) {
    notify('Plugin update in progress');
  } else {
    updating = true;
    // notify('Plugin Update', 'Plugin update in progress');
    install.command(_plugins, config.getConfig(), err => {
      updating = false;
      if (err) {
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
        cache.set('hyper.plugins4', _plugins);
      }
      fn(err);
    });
  }
}

const _shouldUpdate = function () {
  if (cache.get('hyper.plugins4') !== _id) {
    _plugins = config.getPlugins();
    _id = JSON.stringify(_plugins);
    return true;
  }
  return false;
};

const _versionChanged = function (loaded) {
  const paths = _getPaths();
  const total = paths.plugins.length + paths.localPlugins.length;
  const pluginVersions = JSON.stringify(_getPluginVersions(paths));
  const changed = cache.get('hyper.plugins-versions4') !== pluginVersions && loaded === total;
  if (changed) {
    cache.set('hyper.plugins-versions4', pluginVersions);
  }
  return changed;
};

const _load = function (fn) {
  _plugins = config.getPlugins();
  _id = JSON.stringify(_plugins);
  return _requirePlugins(_getPaths(), fn);
};

module.exports = {
  init,
  load: _load,
  versionChanged: _versionChanged,
  getPaths: _getPaths,
  shouldUpdate: _shouldUpdate,
  requirePlugins: _requirePlugins,
  _toDependencies: install.toDependencies
};
