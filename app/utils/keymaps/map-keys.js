const normalize = require('./normalize');

module.exports = config => {
  return Object.keys(config).reduce((keymap, command) => {
    if (!command) {
      return;
    }
    // We can have different keys for a same command.
    const shortcuts = Array.isArray(config[command]) ? config[command] : [config[command]];
    shortcuts.forEach(shortcut => {
      keymap[normalize(shortcut)] = command;
    });
    return keymap;
  }, {});
};
