import {remote} from 'electron';

const {getKeymaps} = remote.require('./config');

export default function isCommands(e) {
  let keys = [];

  if (e.metaKey && process.platform === 'darwin') {
    keys.push('cmd');
  } else if (e.metaKey) {
    keys.push(e.key);
  }

  if (e.ctrlKey) {
    keys.push('ctrl');
  }

  if (e.shiftKey) {
    keys.push('shift');
  }

  if (e.altKey) {
    keys.push('alt');
  }

  if (e.key === ' ') {
    keys.push('space');
  } else if (e.key !== 'Meta' && e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt') {
    keys.push(e.key.replace('Arrow', ''));
  }

  keys = keys.join('+');
  const cmd = getKeymaps().keys[keys.toLowerCase()];
  const action = window.commandRegistry.rgst[cmd];
  if (action) {
    action(e);
  }
  return cmd;
}
