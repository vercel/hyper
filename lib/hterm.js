import {hterm, lib} from 'hterm-umdjs';
import fromCharCode from './utils/key-code';

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
const oldKeyDown = hterm.Keyboard.prototype.onKeyDown_;
hterm.Keyboard.prototype.onKeyDown_ = function (e) {
  const modifierKeysConf = this.terminal.modifierKeys;

  if (e.altKey &&
      e.which !== 16 && // Ignore other modifer keys
      e.which !== 17 &&
      e.which !== 18 &&
      e.which !== 91 &&
      modifierKeysConf.altIsMeta) {
    const char = fromCharCode(e);
    this.terminal.onVTKeystroke('\x1b' + char);
    e.preventDefault();
  }

  if (e.metaKey &&
      e.code !== 'MetaLeft' &&
      e.code !== 'MetaRight' &&
      e.which !== 16 &&
      e.which !== 17 &&
      e.which !== 18 &&
      e.which !== 91 &&
      modifierKeysConf.cmdIsMeta) {
    const char = fromCharCode(e);
    this.terminal.onVTKeystroke('\x1b' + char);
    e.preventDefault();
  }

  if (e.metaKey || e.altKey || (e.ctrlKey && e.code === 'Tab')) {
    return;
  }
  if ((!e.ctrlKey || e.code !== 'ControlLeft') &&
      !e.shiftKey && e.code !== 'CapsLock' &&
      e.key !== 'Dead') {
    //  Test for valid keys in order to clear the terminal selection
    selection.clear(this.terminal);
  }
  return oldKeyDown.call(this, e);
};

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

// will be called by the <Term/> right after the `hterm.Terminal` is instantiated
hterm.Terminal.prototype.onHyperCaret = function (caret) {
  this.hyperCaret = caret;

  // we can ignore `compositionstart` since chromium always fire it with ''
  caret.addEventListener('compositionupdate', () => {
    this.cursorNode_.style.backgroundColor = 'yellow';
    this.cursorNode_.style.borderColor = 'yellow';
  });

  // at this point the char(s) is ready
  caret.addEventListener('compositionend', () => {
    this.cursorNode_.style.backgroundColor = '';
    this.setCursorShape(this.getCursorShape());
    this.cursorNode_.style.borderColor = this.getCursorColor();
    caret.innerText = '';
  });

  // we need to capture pastes, prevent them and send its contents to the terminal
  caret.addEventListener('paste', e => {
    e.stopPropagation();
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    this.onVTKeystroke(text);
  });

  // here we replicate the focus/blur state of our caret on the `hterm` caret
  caret.addEventListener('focus', () => {
    this.cursorNode_.setAttribute('focus', true);
    this.restyleCursor_();
  });
  caret.addEventListener('blur', () => {
    this.cursorNode_.setAttribute('focus', false)
    this.restyleCursor_();
  });

  // this is necessary because we need to access the `document_` and the hyperCaret
  // on `hterm.Screen.prototype.syncSelectionCaret`
  this.primaryScreen_.terminal = this;
  this.alternateScreen_.terminal = this;
};

// ensure that our contenteditable caret is injected
// inside the term's cursor node and that it's focused
hterm.Terminal.prototype.focusHyperCaret = function () {
  if (!this.hyperCaret.parentNode !== this.cursorNode_) {
    this.cursorNode_.appendChild(this.hyperCaret);
  }
  this.hyperCaret.focus();
};

hterm.Screen.prototype.syncSelectionCaret = function () {
  const p = this.terminal.hyperCaret;
  const doc = this.terminal.document_;
  const win = doc.defaultView;
  const s = win.getSelection();
  const r = doc.createRange();
  r.selectNodeContents(p);
  s.removeAllRanges();
  s.addRange(r);
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
