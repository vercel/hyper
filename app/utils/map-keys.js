module.exports = config => {
  return Object.keys(config).reduce((keymap, command) => {
    if (!command) {
      return;
    }
    // We can have different keys for a same command.
    const shortcuts = Array.isArray(config[command]) ? config[command] : [config[command]];
    const fixedShortcuts = []
    shortcuts.forEach(shortcut => {
      let newShortcut = shortcut;
      if (newShortcut.indexOf('cmd') !== -1) {
        // Mousetrap use `command` and not `cmd`        
        console.warn('Your config use deprecated `cmd` in key combination. Please use `command` instead.');
        newShortcut = newShortcut.replace('cmd', 'command');
      }
      fixedShortcuts.push(newShortcut);
    });
    keymap[command] = fixedShortcuts;
    return keymap;
  }, {});
};
