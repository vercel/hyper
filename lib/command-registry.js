import {remote} from 'electron';

const {getDecoratedKeymaps} = remote.require('./plugins');

let commands = {};

export const getRegisteredKeys = () => {
  const keys = {};

  // Prepopulate commands by decorated keymaps config
  console.log('getDecoratedKeymaps', getDecoratedKeymaps());

  const keymaps = getDecoratedKeymaps();

  Object.keys(keymaps).forEach(actionName => {
    const commandKeys = keymaps[actionName];
    commandKeys.forEach(shortcut => {
      keys[shortcut] = actionName;
    });
  });
  return keys;
}



export const registerCommandHandlers = (cmds) => {
  console.log('Registering', cmds);
  if (!cmds) {
    return;
  }

  commands = Object.assign(commands, cmds);
}

export const getCommandHandler = (command) => {
  return commands[command];
}
