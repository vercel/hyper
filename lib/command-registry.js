import {remote} from 'electron';

//const {getDecoratedKeymaps} = remote.require('./plugins');

const commands = {};
//const keys = {};
/*
// Prepopulate commands by decorated keymaps config
console.log('getDecoratedKeymaps', getDecoratedKeymaps());

const roleMap = {
  'editor:copy': 'copy'
};

const keymaps = getDecoratedKeymaps();

Object.keys(keymaps).forEach(actionName => {
  // Is it a Menu action?
  const role = roleMap[actionName];
  const shortcuts = Array.isArray(shortcuts) ? shortcuts : [shortcuts];
  if (role) {
    // Mark first one as a menu
    const [first, ...shortcuts] = keymaps(actionName);
    if (first) {
      keys[normalize(first)] = {
        menu: role
      };
    }
    if (shortcuts) {
      // Mark the others as a role to trigger
      shortcuts.forEach(shortcut => {
        keys[normalize(shortcut)] = {
          role
        };
      });
    }
  }
});
*/

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

export default new CommandRegistry();
