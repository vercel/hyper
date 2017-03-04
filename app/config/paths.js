// This module exports paths, names, and other metadata that is referenced
const {join} = require('path');
const {homedir} = require('os');
const isDev = require('electron-is-dev');

const homeDirPath = homedir();
const repositoryRootPath = join(__dirname, '..');
const hyperHomeDirPath = join(homeDirPath, '.hyper');
const preferencesPath = join(hyperHomeDirPath, 'config.js');
const pluginsPath = join(hyperHomeDirPath, 'plugins');
const keymapPath = join(repositoryRootPath, 'keymaps');
const localPluginsPath = join(pluginsPath, 'local');
const previousConfigPath = join(homeDirPath, '.hyper.js');
const dotHyperPath = join(repositoryRootPath, 'dot-hyper');
const dotConfigPath = join(dotHyperPath, 'config-default.js');
const pkgPath = join(pluginsPath, 'package.json');

module.exports = {
  isDev, repositoryRootPath, homeDirPath, hyperHomeDirPath, preferencesPath, pluginsPath,
  keymapPath, localPluginsPath, previousConfigPath, dotConfigPath, pkgPath
};
