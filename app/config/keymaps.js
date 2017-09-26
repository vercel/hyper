const normalize = require('../utils/keymaps/normalize');

const mapKeys = function(keymap) {
  return Object.keys(keymap).reduce((keys, command) => {
    if (!command) {
      return;
    }
    // We can have different keys for a same command.
    const shortcuts = Array.isArray(keymap[command]) ? keymap[command] : [keymap[command]];
    shortcuts.forEach(shortcut => {
      keys[normalize(shortcut)] = command;
    });
    return keys;
  }, {});
};

module.exports = {
  mapKeys
};
