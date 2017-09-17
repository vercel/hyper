const {getKeymaps} = require('../config/keymaps');

const normalize = keybinding => {
  function sortAlphabetically(a, b) {
    return a.localeCompare(b);
  }

  return keybinding.toLowerCase().split('+').sort(sortAlphabetically).join('+');
};

const findCommandByKeys = (keys, commands) => {
  return commands[normalize(keys)];
};

const getCommand = keys => {
  return findCommandByKeys(keys, getKeymaps().keys);
};

module.exports = {
  normalize,
  findCommandByKeys,
  getCommand
};
