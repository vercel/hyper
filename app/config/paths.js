// This module exports paths, names, and other metadata that is referenced
const {homedir} = require('os');
const {statSync} = require('fs');
const {resolve, join} = require('path');
const isDev = require('electron-is-dev');

const conf = '.hyper.js';
const defaultConf = 'config-default.js';
const homeDir = homedir();

let confPath = join(homeDir, conf);
let confDir = homeDir;

const devDir = resolve(__dirname, '../..');
const devConfig = join(devDir, conf);
const defaultConfig = resolve(__dirname, defaultConf);

const icon = resolve(__dirname, '../static/icon.png');

const keymapPath = resolve(__dirname, '../keymaps');
const darwinKeys = join(keymapPath, 'darwin.json');
const win32Keys = join(keymapPath, 'win32.json');
const linuxKeys = join(keymapPath, 'linux.json');

const defaultPlatformKeyPath = () => {
  switch (process.platform) {
    case 'darwin': return darwinKeys;
    case 'win32': return win32Keys;
    case 'linux': return linuxKeys;
    default: return darwinKeys;
  }
};

if (isDev) {
  // if a local config file exists, use it
  try {
    statSync(devConfig);
    confPath = devConfig;
    confDir = devDir;
    console.log('using config file:', confPath);
  } catch (err) {
    // ignore
  }
}

module.exports = {
  confDir, confPath, conf, defaultConfig, icon, defaultPlatformKeyPath
};
