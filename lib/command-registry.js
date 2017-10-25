import {remote} from 'electron';

const {getDecoratedKeymaps} = remote.require('./plugins');

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

const commands = {};
class CommandRegistry {
  register(cmds) {
    if (cmds) {
      for (const command in cmds) {
        if (command) {
          commands[command] = cmds[command];
        }
      }
    }
  }

  getCommand(cmd) {
    return commands[cmd] !== undefined;
  }

  exec(cmd, e) {
    //commands[cmd](e);
    //execCommand('pane:splitVertical');
  }
}

export const registry = new CommandRegistry();
