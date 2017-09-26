const {readFileSync} = require('fs');
const normalize = require('../utils/keymaps/normalize');
const {defaultPlatformKeyPath} = require('./paths');

const keys = {};

const addKeys = function(keymap) {
  Object.keys(keymap).forEach((command) => {
    if (!command) {
      return;
    }
    // We can have different keys for a same command.
    const shortcuts = Array.isArray(keymap[command]) ? keymap[command] : [keymap[command]];
    shortcuts.forEach((shortcut) => {
      keys[normalize(shortcut)] = command;
    });
  });
  return keys;
};

const importConfig = function(customKeys) {
  try {
    const mapping = JSON.parse(readFileSync(defaultPlatformKeyPath()));
    addKeys(mapping);
    addKeys(customKeys);
    return keys;
  } catch (err) {
    //eslint-disable-next-line no-console
    console.error(err);
  }
};

module.exports = {
  importConfig,
  addKeys
};
