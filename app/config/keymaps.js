const {readFileSync} = require('fs');
const normalize = require('../utils/keymaps/normalize');
const {defaultPlatformKeyPath} = require('./paths');

const commands = {};
const keys = {};

const _setKeysForCommands = function(keymap) {
  for (const command in keymap) {
    if (command) {
      commands[command] = normalize(keymap[command]);
    }
  }
};

const _setCommandsForKeys = function(commands_) {
  for (const command in commands_) {
    if (command) {
      keys[commands_[command]] = command;
    }
  }
};

const _import = function(customKeys) {
  try {
    const mapping = JSON.parse(readFileSync(defaultPlatformKeyPath()));
    _setKeysForCommands(mapping);
    _setKeysForCommands(customKeys);
    _setCommandsForKeys(commands);

    return {commands, keys};
  } catch (err) {
    //eslint-disable-next-line no-console
    console.error(err);
  }
};

const _extend = function(customKeys) {
  if (customKeys) {
    for (const command in customKeys) {
      if (command) {
        commands[command] = normalize(customKeys[command]);
        keys[normalize(customKeys[command])] = command;
      }
    }
  }
  return {commands, keys};
};

module.exports = {
  import: _import,
  extend: _extend
};
