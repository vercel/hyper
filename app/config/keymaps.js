const {readFileSync} = require('fs');
const {join} = require('path');
const _paths = require('./paths');

const commands = {};
const keys = {};

const _setKeysForCommands = function (keyMap) {
  for (const command in keyMap) {
    if (command) {
      commands[command] = keyMap[command].toLowerCase();
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
      case 'darwin': return join(_paths.keymapPath, 'darwin.json');
      case 'win32': return join(_paths.keymapPath, 'win32.json');
      case 'linux': return join(_paths.keymapPath, 'linux.json');
      default: return join(_paths.keymapPath, 'darwin.json');
    }
  };
  try {
    const keyMap = JSON.parse(readFileSync(path()));
    _setKeysForCommands(keyMap);
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
