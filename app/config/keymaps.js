const {readFileSync} = require('fs');
const {join} = require('path');
const _paths = require('./paths');

const commands = {};
const keys = {};
const defaultKeys = {
  darwin: 'darwin.json',
  win32: 'win32.json',
  linux: 'linux.json'
};

const _setKeysForCommands = function (keymap) {
  for (const command in keymap) {
    if (command) {
      commands[command] = keymap[command].toLowerCase();
    }
  }
};

const _setCommandsForKeys = function (commands) {
  for (const command in commands) {
    if (command) {
      keys[commands[command]] = command;
    }
  }
};

const _import = function (customsKeys) {
  const path = () => {
    switch (process.platform) {
      case 'darwin': return join(_paths.keymapPath, defaultKeys.darwin);
      case 'win32': return join(_paths.keymapPath, defaultKeys.win32);
      case 'linux': return join(_paths.keymapPath, defaultKeys.linux);
      default: return join(_paths.keymapPath, defaultKeys.darwin);
    }
  };
  try {
    const mapping = JSON.parse(readFileSync(path()));
    _setKeysForCommands(mapping);
    _setKeysForCommands(customsKeys);
    _setCommandsForKeys(commands);

    return {commands, keys};
  } catch (err) {}
};

const _extend = function (customsKeys) {
  if (customsKeys) {
    for (const command in customsKeys) {
      if (command) {
        commands[command] = customsKeys[command];
        keys[customsKeys[command]] = command;
      }
    }
  }
  return {commands, keys};
};

module.exports = {
  import: _import,
  extend: _extend
};
