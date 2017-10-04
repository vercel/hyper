const {readFileSync} = require('fs');
const normalize = require('../utils/keymaps/normalize');
const {defaultPlatformKeyPath} = require('./paths');

const commands = {};
const keys = {};

const generatePrefixedCommand = function(command, key) {
  const baseCmd = command.replace(/:prefix$/, '');
  for (let i = 1; i <= 9; i++) {
    // 9 is a special number because it means 'last'
    const index = i === 9 ? 'last' : i;
    commands[`${baseCmd}:${index}`] = normalize(`${key}+${i}`);
  }
};

const _setKeysForCommands = function(keymap) {
  for (const command in keymap) {
    if (command) {
      // In case of a command finishing by :prefix
      // we need to generate commands and keys
      if (command.endsWith(':prefix')) {
        generatePrefixedCommand(command, keymap[command]);
      } else {
        commands[command] = normalize(keymap[command]);
      }
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
