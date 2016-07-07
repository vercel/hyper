// const { ipcMain } = require('electron');
const { homedir } = require('os');
const { resolve } = require('path');
const { readFileSync, writeFileSync } = require('fs');
const gaze = require('gaze');
const vm = require('vm');

const path = resolve(homedir(), '.hyperterm.js');

let cfg = {};

function watch () {
  gaze(path, () => {
    console.log('a change happened');
  });
}

function exec (str) {
  const script = new vm.Script(str);
  const module = {};
  script.runInNewContext({ module });
  const cfg = module.exports.config;
  if (!module.exports) {
    throw new Error('Error reading configuration: `module.exports` not set');
  }
  if (!cfg) {
    throw new Error('Error reading configuration: `config` key is missing');
  }
  return cfg;
}

exports.init = function () {
  try {
    exec(readFileSync(path, 'utf8'));
  } catch (err) {
    console.log('read error', path, err.message);
    const defaultConfig = readFileSync(resolve(__dirname, 'config-default.js'));
    try {
      console.log('attempting to write default config to', path);
      cfg = exec(defaultConfig);
      writeFileSync(path, defaultConfig);
    } catch (err) {
      throw new Error(`Failed to write config to ${path}`);
    }
  }
  watch();
};

exports.get = function () {
  return cfg;
};
