const generatePrefixedCommand = (command, shortcuts) => {
  const result = {};
  const baseCmd = command.replace(/:prefix$/, '');
  for (let i = 1; i <= 9; i++) {
    // 9 is a special number because it means 'last'
    const index = i === 9 ? 'last' : i;
    const prefixedShortcuts = shortcuts.map(shortcut => `${shortcut}+${i}`);
    result[`${baseCmd}:${index}`] = prefixedShortcuts;
  }

  return result;
};

module.exports = config => {
  return Object.keys(config).reduce((keymap, command) => {
    if (!command) {
      return;
    }
    // We can have different keys for a same command.
    const shortcuts = Array.isArray(config[command]) ? config[command] : [config[command]];
    const fixedShortcuts = [];
    shortcuts.forEach(shortcut => {
      let newShortcut = shortcut;
      if (newShortcut.indexOf('cmd') !== -1) {
        // Mousetrap use `command` and not `cmd`
        //eslint-disable-next-line no-console
        console.warn('Your config use deprecated `cmd` in key combination. Please use `command` instead.');
        newShortcut = newShortcut.replace('cmd', 'command');
      }
      fixedShortcuts.push(newShortcut);
    });

    if (command.endsWith(':prefix')) {
      return Object.assign(keymap, generatePrefixedCommand(command, fixedShortcuts));
    }

    keymap[command] = fixedShortcuts;

    return keymap;
  }, {});
};
