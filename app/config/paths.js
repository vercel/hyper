// This module exports paths, names, and other metadata that is referenced
const {join} = require('path');
const {homedir} = require('os');
const isDev = require('electron-is-dev');

const conf = 'config.js';
const homeDir = homedir();
const previousConfig = join(homeDir, '.hyper.js');

const root = join(__dirname, '..');
const hyperDir = join(homeDir, '.hyper');
const hyperPlugins = join(hyperDir, 'plugins');
const localPlugins = join(hyperDir, 'local');
const pkg = join(hyperPlugins, 'package.json');
const prodConf = join(hyperDir, conf);

const devDir = join(hyperDir, 'DEV');
const devConfig = join(devDir, conf);

const dotHyper = join(root, 'dot-hyper');
const defaultConf = join(dotHyper, 'default.js');

const keymapPath = join(root, 'keymaps');
const darwinKeys = join(keymapPath, 'darwin.json');
const win32Keys = join(keymapPath, 'win32.json');
const linuxKeys = join(keymapPath, 'linux.json');

module.exports = {
  isDev, homeDir, hyperDir, hyperPlugins, devDir, devConfig, prodConf, pkg,
  localPlugins, previousConfig, defaultConf, darwinKeys, win32Keys, linuxKeys
};
