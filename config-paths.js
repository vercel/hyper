const { app } = require('electron');
const { homedir } = require('os');
const { resolve } = require('path');
const { existsSync } = require('fs');

const home = homedir();
const root = resolve(app.getPath('appData'), 'HyperTerm');
const legacyConfig = resolve(home, './.hyperterm.js');
const legacy = existsSync(legacyConfig);

module.exports = legacy? {
  root: home,
  config: legacyConfig,
  plugins: resolve(home, './.hyperterm_plugins'),
  localPlugins: resolve(home, './.hyperterm_plugins', './local'),
  resolveConfigPath: (...paths) => resolve(home, ...paths)
}:{
  root: root,
  config: resolve(root, './init.js'),
  plugins: resolve(root, './plugins'),
  localPlugins: resolve(root, './plugins', './local'),
  resolveConfigPath: (...paths) => resolve(root, ...paths)
};
