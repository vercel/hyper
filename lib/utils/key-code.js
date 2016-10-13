/**
 * Keyboard event keyCodes have proven to be really unreliable.
 * This util function will cover most of the edge cases where
 * String.fromCharCode() doesn't work.
 */

const _toAscii = {
  188: '44',
  109: '45',
  190: '46',
  191: '47',
  192: '96',
  220: '92',
  222: '39',
  221: '93',
  219: '91',
  173: '45',
  187: '61', // IE Key codes
  186: '59', // IE Key codes
  189: '45'  // IE Key codes
};

const _shiftUps = {
  96: '~',
  49: '!',
  50: '@',
  51: '#',
  52: '$',
  53: '%',
  54: '^',
  55: '&',
  56: '*',
  57: '(',
  48: ')',
  45: '_',
  61: '+',
  91: '{',
  93: '}',
  92: '|',
  59: ':',
  39: '\'',
  44: '<',
  46: '>',
  47: '?'
};

const _arrowKeys = {
  38: '[A',
  40: '[B',
  39: '[C',
  37: '[D'
};

/**
 * This fn takes a keyboard event and returns
 * the character that was pressed. This fn
 * purposely doesn't take into account if the alt/meta
 * key was pressed.
 */
export default function fromCharCode(e) {
  let code = String(e.which);

  if ({}.hasOwnProperty.call(_arrowKeys, code)) {
    return _arrowKeys[code];
  }

  if ({}.hasOwnProperty.call(_toAscii, code)) {
    code = _toAscii[code];
  }

  const char = String.fromCharCode(code);
  if (e.shiftKey) {
    if ({}.hasOwnProperty.call(_shiftUps, code)) {
      return _shiftUps[code];
    }
    return char.toUpperCase();
  }
  return char.toLowerCase();
}
