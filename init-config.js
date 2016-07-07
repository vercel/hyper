const { resolve } = require('path');
const { statSync, readFileSync, writeFileSync } = require('fs');
const file = require('./config-path');

module.exports = function initConfig () {
  try {
    statSync(file);
  } catch (err) {
    console.log('stat error', file, err.message);
    const defaultConfig = readFileSync(resolve(__dirname, 'config-default.js'));
    try {
      console.log('attempting to write default config to', file);
      writeFileSync(file, defaultConfig);
    } catch (err) {
      throw new Error(`Failed to write config to ${file}`);
    }
  }

  return file;
};
