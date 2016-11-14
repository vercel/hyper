import {hterm, lib} from 'hterm-umdjs';
// import fromCharCode from './utils/key-code';

const selection = require('./utils/selection');

hterm.defaultStorage = new lib.Storage.Memory();

// Provide selectAll to terminal viewport
hterm.Terminal.prototype.selectAll = function () {
  // We need to clear the DOM range to reset anchorNode
  selection.clear(this);
  selection.all(this);
};

// override double click behavior to copy
const oldMouse = hterm.Terminal.prototype.onMouse_;
hterm.Terminal.prototype.onMouse_ = function (e) {
  if (e.type === 'dblclick') {
    selection.extend(this);
    console.log('[hyper+hterm] ignore double click');
    return;
  }
  return oldMouse.call(this, e);
};

// there's no option to turn off the size overlay
hterm.Terminal.prototype.overlaySize = function () {};

// fixing a bug in hterm where a double click triggers
// a non-collapsed selection whose text is '', and results
// in an infinite copy loop
hterm.Terminal.prototype.copySelectionToClipboard = function () {
  const text = this.getSelectionText();
  if (text) {
    this.copyStringToClipboard(text);
  }
};

// passthrough all the commands that are meant to control
// hyper and not the terminal itself
// const oldKeyDown = hterm.Keyboard.prototype.onKeyDown_;
// hterm.Keyboard.prototype.onKeyDown_ = function (e) {
//   const modifierKeysConf = this.terminal.modifierKeys;
//
//   /**
//    * Add fixes for U.S. International PC Keyboard layout
//    * These keys are sent through as 'Dead' keys, as they're used as modifiers.
//    * Ignore that and insert the correct character.
//    */
//   if (e.key === 'Dead') {
//     if (e.code === 'Quote' && e.shiftKey === false) {
//       this.terminal.onVTKeystroke('\'');
//       return;
//     }
//     if (e.code === 'Quote' && e.shiftKey === true) {
//       this.terminal.onVTKeystroke('"');
//       return;
//     }
//     if ((e.code === 'IntlBackslash' || e.code === 'Backquote') && e.shiftKey === true) {
//       this.terminal.onVTKeystroke('~');
//       return;
//     }
//     // This key is also a tilde on all tested keyboards
//     if (e.code === 'KeyN' && e.altKey === true && modifierKeysConf.altIsMeta === false) {
//       this.terminal.onVTKeystroke('~');
//       return;
//     }
//     if ((e.code === 'IntlBackslash' || e.code === 'Backquote') && e.shiftKey === false) {
//       this.terminal.onVTKeystroke('`');
//       return;
//     }
//     if (e.code === 'Digit6') {
//       this.terminal.onVTKeystroke('^');
//       return;
//     }
//     // German keyboard layout
//     if (e.code === 'Equal' && e.shiftKey === false) {
//       this.terminal.onVTKeystroke('´');
//       return;
//     }
//     if (e.code === 'Equal' && e.shiftKey === true) {
//       this.terminal.onVTKeystroke('`');
//       return;
//     }
//     // Italian keyboard layout
//     if (e.code === 'Digit9' && e.altKey === true && modifierKeysConf.altIsMeta === false) {
//       this.terminal.onVTKeystroke('`');
//       return;
//     }
//     if (e.code === 'Digit8' && e.altKey === true && modifierKeysConf.altIsMeta === false) {
//       this.terminal.onVTKeystroke('´');
//       // To fix issue with changing the terminal prompt
//       e.preventDefault();
//       return;
//     }
//     // French keyboard layout
//     if (e.code === 'BracketLeft') {
//       this.terminal.onVTKeystroke('^');
//       return;
//     }
//     if (e.code === 'Backslash') {
//       this.terminal.onVTKeystroke('`');
//       return;
//     }
//     console.warn('Uncaught dead key on international keyboard', e);
//   }
//
//   if (e.altKey &&
//       e.which !== 16 && // Ignore other modifer keys
//       e.which !== 17 &&
//       e.which !== 18 &&
//       e.which !== 91 &&
//       modifierKeysConf.altIsMeta) {
//     const char = fromCharCode(e);
//     this.terminal.onVTKeystroke('\x1b' + char);
//     e.preventDefault();
//   }
//
//   if (e.metaKey &&
//       e.code !== 'MetaLeft' &&
//       e.code !== 'MetaRight' &&
//       e.which !== 16 &&
//       e.which !== 17 &&
//       e.which !== 18 &&
//       e.which !== 91 &&
//       modifierKeysConf.cmdIsMeta) {
//     const char = fromCharCode(e);
//     this.terminal.onVTKeystroke('\x1b' + char);
//     e.preventDefault();
//   }
//
//   if (e.metaKey || e.altKey || (e.ctrlKey && e.code === 'Tab')) {
//     return;
//   }
//   if ((!e.ctrlKey || e.code !== 'ControlLeft') && !e.shiftKey && e.code !== 'CapsLock') {
//     //  Test for valid keys in order to clear the terminal selection
//     selection.clear(this.terminal);
//   }
//   return oldKeyDown.call(this, e);
// };

const oldKeyPress = hterm.Keyboard.prototype.onKeyPress_;
hterm.Keyboard.prototype.onKeyPress_ = function (e) {
  if (e.metaKey) {
    return;
  }
  selection.clear(this.terminal);
  return oldKeyPress.call(this, e);
};

// we re-implement `wipeContents` to preserve the line
// and cursor position that the client is in.
// otherwise the user ends up with a completely clear
// screen which is really strange
hterm.Terminal.prototype.clearPreserveCursorRow = function () {
  this.scrollbackRows_.length = 0;
  this.scrollPort_.resetCache();

  [this.primaryScreen_, this.alternateScreen_].forEach(screen => {
    const bottom = screen.getHeight();
    if (bottom > 0) {
      this.renumberRows_(0, bottom);

      const x = screen.cursorPosition.column;
      const y = screen.cursorPosition.row;

      if (x === 0) {
        // Empty screen, nothing to do.
        return;
      }

      // here we move the row that the user was focused on
      // to the top of the screen
      this.moveRows_(y, 1, 0);

      for (let i = 1; i < bottom; i++) {
        screen.setCursorPosition(i, 0);
        screen.clearCursorRow();
      }

      // we restore the cursor position
      screen.setCursorPosition(0, x);
    }
  });

  this.syncCursorPosition_();
  this.scrollPort_.invalidate();

  // this will avoid a bug where the `wipeContents`
  // hterm API doesn't send the scroll to the top
  this.scrollPort_.redraw_();
};

const oldOnMouse = hterm.Terminal.prototype.onMouse_;
hterm.Terminal.prototype.onMouse_ = function (e) {
  // override `preventDefault` to not actually
  // prevent default when the type of event is
  // mousedown, so that we can still trigger
  // focus on the terminal when the underlying
  // VT is interested in mouse events, as is the
  // case of programs like `vtop` that allow for
  // the user to click on rows
  if (e.type === 'mousedown') {
    e.preventDefault = function () { };
  }

  return oldOnMouse.call(this, e);
};

// make background transparent to avoid transparency issues
hterm.ScrollPort.prototype.setBackgroundColor = function () {
  this.screen_.style.backgroundColor = 'transparent';
};

// fixes a bug in hterm, where the shorthand hex
// is not properly converted to rgb
lib.colors.hexToRGB = function (arg) {
  const hex16 = lib.colors.re_.hex16;
  const hex24 = lib.colors.re_.hex24;

  function convert(hex) {
    if (hex.length === 4) {
      hex = hex.replace(hex16, (h, r, g, b) => {
        return '#' + r + r + g + g + b + b;
      });
    }
    const ary = hex.match(hex24);
    if (!ary) {
      return null;
    }

    return 'rgb(' +
      parseInt(ary[1], 16) + ', ' +
      parseInt(ary[2], 16) + ', ' +
      parseInt(ary[3], 16) +
    ')';
  }

  if (arg instanceof Array) {
    for (let i = 0; i < arg.length; i++) {
      arg[i] = convert(arg[i]);
    }
  } else {
    arg = convert(arg);
  }

  return arg;
};

export default hterm;
export {lib};
