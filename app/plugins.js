const {app} = require('electron');
const {pluginsPath, localPluginsPath} = require('./config/paths');
const config = require('./config');
const utils = require('./plugins/init');
const notify = require('./notify');

const watchers = [];
let modules;

const _fetch = ({force = false} = {}) => {
  utils.init(err => {
    (() => {
      // trigger unload hooks
      modules.forEach(mod => {
        if (mod.onUnload) {
          mod.onUnload(app);
        }
      });
      // clear require cache
      for (const entry in require.cache) {
        if (entry.indexOf(pluginsPath) === 0 || entry.indexOf(localPluginsPath) === 0) {
          delete require.cache[entry];
        }
      }
    });
    modules = utils.load();
    if (utils.versionChanged(modules.length)) {
      notify(
        'Plugins Updated',
        'Restart the app or hot-reload with "View" > "Reload" to enjoy the updates!'
      );
    }
    watchers.forEach(fn => fn(err, {force}));
  });
};

modules = utils.load(() => {
  _fetch();
});

const _subscribe = function (fn) {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

const _update = function ({force = false} = {}) {
  if (utils.shouldUpdate()) {
    _fetch({force});
  }
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

const _decorateMenu = function (tpl) {
  return decorateObject(tpl, 'decorateMenu');
};

const _getDecoratedEnv = function (baseEnv) {
  return decorateObject(baseEnv, 'decorateEnv');
};

const _getDecoratedConfig = function () {
  const baseConfig = config.getConfig();
  return decorateObject(baseConfig, 'decorateConfig');
};

const _getDecoratedBrowserOptions = function (defaults) {
  return decorateObject(defaults, 'decorateBrowserOptions');
};

const _onApp = function (app) {
  modules.forEach(plugin => {
    if (plugin.onApp) {
      plugin.onApp(app);
    }
  });
};

const _onWindow = function (win) {
  modules.forEach(plugin => {
    if (plugin.onWindow) {
      plugin.onWindow(win);
    }
  });
};

// get paths from renderer
const _getBasePaths = function () {
  return {path: pluginsPath, localPath: localPluginsPath};
};

// we listen on configuration updates to trigger
// plugin installation
config.subscribe(() => {
  if (utils.shouldUpdate()) {
    // install immediately if the user changed plugins
    _fetch();
  }
});

module.exports = {
  updatePlugins: _update,
  getBasePaths: _getBasePaths,  // get paths from renderer
  getPaths: utils.getPaths, // expose to renderer
  subscribe: _subscribe,
  decorateMenu: _decorateMenu,
  onApp: _onApp,
  onWindow: _onWindow,
  getDecoratedEnv: _getDecoratedEnv,
  getDecoratedConfig: _getDecoratedConfig,
  getDecoratedBrowserOptions: _getDecoratedBrowserOptions
};
