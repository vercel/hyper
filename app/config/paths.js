// This module exports paths, names, and other metadata that is referenced
const path = require('path');
const {homedir} = require('os');
const isDev = require('electron-is-dev');

const homeDirPath = homedir();
const repositoryRootPath = path.resolve(__dirname, '..');
const hyperHomeDirPath = path.join(homeDirPath, '.hyper');
const preferencesPath = path.join(hyperHomeDirPath, 'config.js');
const pluginsPath = path.join(hyperHomeDirPath, 'plugins');
const keymapPath = path.join(hyperHomeDirPath, 'keymap.js');
const localPluginsPath = path.join(pluginsPath, 'local');
const previousConfigPath = path.join(homeDirPath, '.hyper.js');
const dotHyperPath = path.join(repositoryRootPath, 'dot-hyper');
const dotConfigPath = path.join(dotHyperPath, 'config-default.js');
const pkgPath = path.join(pluginsPath, 'package.json');

module.exports = {
  isDev, repositoryRootPath, homeDirPath, hyperHomeDirPath, preferencesPath, pluginsPath,
  keymapPath, localPluginsPath, previousConfigPath, dotConfigPath, pkgPath
};
