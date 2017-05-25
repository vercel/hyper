// This module exports paths, names, and other metadata that is referenced
const {homedir} = require('os');
const isDev = require('electron-is-dev');

const conf = '.hyper.js';
const defaultConf = 'config-default.js';

const homeDir = homedir();

module.exports = {
  isDev, homeDir, conf, defaultConf
};
