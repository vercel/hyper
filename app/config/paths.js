// This module exports paths, names, and other metadata that is referenced
const {homedir} = require('os');
const {statSync} = require('fs');
const {resolve} = require('path');
const isDev = require('electron-is-dev');

const conf = '.hyper.js';
const defaultConf = 'config-default.js';
const legacyConf = '.hyperterm.js';
const homeDir = homedir();

let confPath = resolve(homeDir, conf);
let confDir = homeDir;

const devDir = resolve(__dirname, '../..');
const devConfig = resolve(devDir, conf);
const defaultConfig = resolve(__dirname, defaultConf);
const pathLegacy = resolve(homeDir, legacyConf);

const icon = resolve(__dirname, 'static/icon.png');

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
  pathLegacy, confDir, confPath, conf, defaultConfig, defaultConf, icon
};
