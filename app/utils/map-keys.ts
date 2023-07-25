const generatePrefixedCommand = (command: string, shortcuts: string[]) => {
  const result: Record<string, string[]> = {};
  const baseCmd = command.replace(/:prefix$/, '');
  for (let i = 1; i <= 9; i++) {
    // 9 is a special number because it means 'last'
    const index = i === 9 ? 'last' : i;
    const prefixedShortcuts = shortcuts.map((shortcut) => `${shortcut}+${i}`);
    result[`${baseCmd}:${index}`] = prefixedShortcuts;
  }

  return result;
};

const mapKeys = (config: Record<string, string[] | string>) => {
  return Object.keys(config).reduce((keymap: Record<string, string[]>, command: string) => {
    if (!command) {
      return keymap;
    }
    // We can have different keys for a same command.
    const _shortcuts = config[command];
    const shortcuts = Array.isArray(_shortcuts) ? _shortcuts : [_shortcuts];
    const fixedShortcuts: string[] = [];
    shortcuts.forEach((shortcut) => {
      let newShortcut = shortcut;
      if (newShortcut.indexOf('cmd') !== -1) {
        // Mousetrap use `command` and not `cmd`
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

export default mapKeys;
