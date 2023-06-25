const generatePrefixedCommand = (command: string, shortcuts: string[]) => {
  const result: Record<string, string[]> = {};
  const baseCmd = command.replace(/:prefix$/, '');
  for (let i = 1; i <= 9; i++) {
    // 9 is a special number because it means 'last'
    const index = i === 9 ? 'last' : i;
    result[`${baseCmd}:${index}`] = [];
    for (let j = 0; j < shortcuts.length; j++) {
      result[`${baseCmd}:${index}`].push(`${shortcuts[j]}+${i}`);
    }
  }

  return result;
};

export default (config: Record<string, string[] | string>) => {
  const keymap: Record<string, string[]> = {};

  for (const command in config) {
    if (!command) {
      continue;
    }

    const _shortcuts = config[command];
    const shortcuts = Array.isArray(_shortcuts) ? _shortcuts : [_shortcuts];
    const fixedShortcuts: string[] = [];

    for (const shortcut of shortcuts) {
      let newShortcut = shortcut;
      if (newShortcut.includes('cmd')) {
        console.warn('Your config use deprecated `cmd` in key combination. Please use `command` instead.');
        newShortcut = newShortcut.replace('cmd', 'command');
      }
      fixedShortcuts.push(newShortcut);
    }

    if (command.endsWith(':prefix')) {
      Object.assign(keymap, generatePrefixedCommand(command, fixedShortcuts));
    } else {
      keymap[command] = fixedShortcuts;
    }
  }

  return keymap;
};
