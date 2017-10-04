import {remote} from 'electron';

const getCommand = remote.require('./utils/keymaps/get-command');

// Key handling is deeply inspired by Mousetrap
// https://github.com/ccampbell/mousetrap

const _EXCLUDE = {
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  91: 'meta',
  93: 'meta',
  224: 'meta'
};

const _MAP = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  20: 'capslock',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'ins',
  46: 'del'
};

const _KEYCODE_MAP = {
  106: '*',
  107: '+',
  109: '-',
  110: '.',
  111: '/',
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: "'"
};

const characterFromEvent = e => {
  if (_EXCLUDE[e.which]) {
    return;
  }

  if (_MAP[e.which]) {
    return _MAP[e.which];
  }

  if (_KEYCODE_MAP[e.which]) {
    return _KEYCODE_MAP[e.which];
  }

  // if it is not in the special map

  // with keydown and keyup events the character seems to always
  // come in as an uppercase character whether you are pressing shift
  // or not.  we should make sure it is always lowercase for comparisons

  return String.fromCharCode(e.which).toLowerCase();
};

export default function returnKey(e) {
  const character = characterFromEvent(e);
  if (!character) {
    return false;
  }

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

  keys.push(character);

  return getCommand(keys.join('+'));
}
