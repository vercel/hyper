import type {HyperDispatch} from '../typings/hyper';

import {closeSearch} from './actions/sessions';
import {ipcRenderer} from './utils/ipc';

let commands: Record<string, (event: any, dispatch: HyperDispatch) => void> = {
  'editor:search-close': (e, dispatch) => {
    dispatch(closeSearch(undefined, e));
    window.focusActiveTerm();
  }
};

export const getRegisteredKeys = async () => {
  const keymaps = await ipcRenderer.invoke('getDecoratedKeymaps');

  return Object.keys(keymaps).reduce((result: Record<string, string>, actionName) => {
    const commandKeys = keymaps[actionName];
    commandKeys.forEach((shortcut) => {
      result[shortcut] = actionName;
    });
    return result;
  }, {});
};

export const registerCommandHandlers = (cmds: typeof commands) => {
  if (!cmds) {
    return;
  }

  commands = Object.assign(commands, cmds);
};

export const getCommandHandler = (command: string) => {
  return commands[command];
};

// Some commands are directly excuted by Electron menuItem role.
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

export const shouldPreventDefault = (command: string) => !roleCommands.includes(command);
