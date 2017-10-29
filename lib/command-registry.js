import {remote} from 'electron';

const {getDecoratedKeymaps} = remote.require('./plugins');

let commands = {};

export const getRegisteredKeys = () => {
  const keymaps = getDecoratedKeymaps();

  return Object.keys(keymaps).reduce((result, actionName) => {
    const commandKeys = keymaps[actionName];
    commandKeys.forEach(shortcut => {
      result[shortcut] = actionName;
    });
    return result;
  }, {});
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

// Some commands are firectly excuted by Electron menuItem role.
// They should not be prevented to reach Electron.
const roleCommands = [
  'window:close',
  'editor:undo',
  'editor:redo',
  'editor:cut',
  'editor:copy',
  'editor:paste',
  'editor:selectAll',
  'window:minimize',
  'window:zoom',
  'window:toggleFullScreen'
];

export const shouldPreventDefault = command => !roleCommands.includes(command);
