// This module exports paths, names, and other metadata that is referenced
const {homedir} = require('os');
const {statSync} = require('fs');
const {resolve, join} = require('path');
const isDev = require('electron-is-dev');

const cfgFile = '.hyper.js';
const defaultCfgFile = 'config-default.js';
let homeDir = homedir();

if (process.platform === 'win32') {
    homeDir = resolve(homeDir, 'AppData\\Roaming\\Hyper');
}

let cfgPath = join(homeDir, cfgFile);
let cfgDir = homeDir;

const devDir = resolve(__dirname, '../..');
const devCfg = join(devDir, cfgFile);
const defaultCfg = resolve(__dirname, defaultCfgFile);

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
    statSync(devCfg);
    cfgPath = devCfg;
    cfgDir = devDir;
    console.log('using config file:', cfgPath);
  } catch (err) {
    // ignore
  }
}

module.exports = {
  cfgDir, cfgPath, cfgFile, defaultCfg, icon, defaultPlatformKeyPath
};
