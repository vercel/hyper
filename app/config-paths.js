const {app} = require('electron');
const {join} = require('path');
const {homedir} = require('os');
const {existsSync} = require('fs');
const {productName} = require('./package.json');

const xdgDir = process.env.XDG_CONFIG_HOME ?
  join(process.env.XDG_CONFIG_HOME, productName) : false;
const userDataDir = app.getPath('userData');
const legacyDir = homedir();

const xdgConfig = xdgDir ? join(xdgDir, 'init.js') : '';
const userDataConfig = join(userDataDir, 'init.js');
const legacyConfig = join(legacyDir, '.hyper.js');

const xdg = existsSync(xdgConfig);
const userData = existsSync(userDataConfig);
const legacy = existsSync(legacyConfig);

let paths;

if (xdg || (xdgDir && !userData && !legacy)) {
  paths = {
    root: xdgDir,
    config: xdgConfig,
    plugins: join(xdgDir, 'plugins'),
    localPlugins: join(xdgDir, 'plugins', 'local'),
    joinConfigPath: (...paths) => join(xdgDir, ...paths)
  };
} else if (userData || !legacy) {
  paths = {
    root: userDataDir,
    config: userDataConfig,
    plugins: join(userDataDir, 'plugins'),
    localPlugins: join(userDataDir, 'plugins', 'local'),
    joinConfigPath: (...paths) => join(userDataDir, ...paths)
  };
} else {
  paths = {
    root: legacyDir,
    config: legacyConfig,
    plugins: join(legacyDir, '.hyper_plugins'),
    localPlugins: join(legacyDir, '.hyper_plugins', 'local'),
    joinConfigPath: (...paths) => join(legacyDir, ...paths)
  };
}

module.exports = paths;
