const { homedir } = require('os');
const { resolve } = require('path');
const { statSync, readFileSync, writeFileSync } = require('fs');

module.exports = function initConfig () {
  const file = resolve(homedir(), '.hyperterm.js');

  try {
    statSync(file);
  } catch (err) {
    console.log('stat error', file, err.message);
    const defaultConfig = readFileSync(resolve(__dirname, 'default-config.js'));
    try {
      console.log('attempting to write default config to', file);
      writeFileSync(file, defaultConfig);
    } catch (err) {
      throw new Error(`Failed to write config to ${file}`);
    }
  }

  return file;
};
