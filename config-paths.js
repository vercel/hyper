const { app } = require('electron');
const { join } = require('path');
const { homedir } = require('os');
const { existsSync } = require('fs');

const home = homedir();
const root = app.getPath('userData');
const legacyConfig = join(home, '.hyperterm.js');
const legacy = existsSync(legacyConfig);

module.exports = legacy? {
  root: home,
  config: legacyConfig,
  plugins: join(home, '.hyperterm_plugins'),
  localPlugins: join(home, '.hyperterm_plugins', 'local'),
  joinConfigPath: (...paths) => join(home, ...paths)
}:{
  root,
  config: join(root, 'init.js'),
  plugins: join(root, 'plugins'),
  localPlugins: join(root, 'plugins', 'local'),
  joinConfigPath: (...paths) => join(root, ...paths)
};
