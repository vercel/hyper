import {remote} from 'electron';

const {getDecoratedKeymaps} = remote.require('./plugins');

let commands = {};

export const getRegisteredKeys = () => {
  const keys = {};

  const keymaps = getDecoratedKeymaps();

  const generatePrefixedCommand = (actionName, prefixKeys) => {
    const baseName = actionName.replace(/:prefix$/, '');
    for (let i = 1; i <= 9; i++) {
      // 9 is a special number because it means 'last'
      const index = i === 9 ? 'last' : i;
      keys[`${prefixKeys}+${i}`] = `${baseName}:${index}`;
    }
  };

  Object.keys(keymaps).forEach(actionName => {
    const commandKeys = keymaps[actionName];
    commandKeys.forEach(shortcut => {
      // In case of a command finishing by :prefix
      // we need to generate commands and keys
      if (actionName.endsWith(':prefix')) {
        generatePrefixedCommand(actionName, shortcut);
      } else {
        keys[shortcut] = actionName;
      }
    });
  });
  return keys;
};

export const registerCommandHandlers = cmds => {
  if (!cmds) {
    return;
  }

  commands = Object.assign(commands, cmds);
};

export const getCommandHandler = command => {
  return commands[command];
};
