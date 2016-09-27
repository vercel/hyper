import {hterm, lib} from 'hterm-umdjs';
import runes from 'runes';

import fromCharCode from './utils/key-code';
import selection from './utils/selection';

hterm.defaultStorage = new lib.Storage.Memory();

// The current width of characters rendered in hterm
let charWidth;
// Containers to resize when char width changes
const containers = [];

// Provide selectAll to terminal viewport
hterm.Terminal.prototype.selectAll = function () {
  // We need to clear the DOM range to reset anchorNode
  selection.clear(this);
  selection.all(this);
};

const oldSetFontSize = hterm.Terminal.prototype.setFontSize;
hterm.Terminal.prototype.setFontSize = function (px) {
  oldSetFontSize.call(this, px);
  charWidth = this.scrollPort_.characterSize.width;
  // @TODO Maybe clear old spans from the list of spans to resize ?
  // Resize all containers to match the new whar width.
  containers.forEach(container => {
    if (container && container.style) {
      container.style.width = `${container.wcNode ? charWidth * 2 : charWidth}px`;
    }
  });
};

const oldSyncFontFamily = hterm.Terminal.prototype.syncFontFamily;
hterm.Terminal.prototype.syncFontFamily = function () {
  oldSyncFontFamily.call(this);
  this.setFontSize();
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

function containsNonLatinCodepoints(s) {
  return /[^\u0000-\u00ff]/.test(s);
}
hterm.Terminal.IO.prototype.writeUTF8 = function (string) {
  if (this.terminal_.io !== this) {
    throw new Error('Attempt to print from inactive IO object.');
  }

  if (containsNonLatinCodepoints(string)) {
    const splitString = runes(string);
    const length = splitString.length;
    this.terminal_.getTextAttributes().hasUnicode = true;

    for (let curChar = 0; curChar <= length; curChar++) {
      this.terminal_.interpret(splitString[curChar]);
    }

    this.terminal_.getTextAttributes().hasUnicode = false;
  } else {
    this.terminal_.interpret(string);
  }
};

const oldCreateContainer = hterm.TextAttributes.prototype.createContainer;
hterm.TextAttributes.prototype.createContainer = function (text) {
  const container = oldCreateContainer.call(this, text);

  if (container.style && text.length === 1 && containsNonLatinCodepoints(text)) {
    container.style.width = `${container.wcNode ? charWidth * 2 : charWidth}px`;
    container.style.display = 'inline-block';

    // If the container has unicode text, the char can overlap neigbouring containers. We need
    // to ensure that the text is not hidden behind other containers.
    container.style.overflow = 'visible';
    container.style.position = 'relative';

    // Remember this container to resize it later when font size changes.
    containers.push(container);
  }

  return container;
};

// Do not match containers when one of them has unicode text (unicode chars need to be alone in their containers)
const oldMatchesContainer = hterm.TextAttributes.prototype.matchesContainer;
hterm.TextAttributes.prototype.matchesContainer = function (obj) {
  const content = typeof obj === 'string' ? obj : obj.textContent;
  if (containsNonLatinCodepoints(content)) {
    return false;
  }

  if (this.hasUnicode) {
    return false;
  }

  return oldMatchesContainer.call(this, obj);
};

/**
 * Override 'containersMatch' so that containers with unicode do not match anything.
 */
const oldContainersMatch = hterm.TextAttributes.containersMatch;
hterm.TextAttributes.containersMatch = function (obj1, obj2) {
  const content1 = typeof obj1 === 'string' ? obj1 : obj1.textContent;
  const content2 = typeof obj2 === 'string' ? obj2 : obj2.textContent;

  if (containsNonLatinCodepoints(content1) || containsNonLatinCodepoints(content2)) {
    return false;
  }

  return oldContainersMatch(obj1, obj2);
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

  /**
   * Add fixes for U.S. International PC Keyboard layout
   * These keys are sent through as 'Dead' keys, as they're used as modifiers.
   * Ignore that and insert the correct character.
   */
  if (e.key === 'Dead') {
    if (e.code === 'Quote' && e.shiftKey === false) {
      this.terminal.onVTKeystroke('\'');
      return;
    }
    if (e.code === 'Quote' && e.shiftKey === true) {
      this.terminal.onVTKeystroke('"');
      return;
    }
    if ((e.code === 'IntlBackslash' || e.code === 'Backquote') && e.shiftKey === true) {
      this.terminal.onVTKeystroke('~');
      return;
    }
    // This key is also a tilde on all tested keyboards
    if (e.code === 'KeyN' && e.altKey === true && modifierKeysConf.altIsMeta === false) {
      this.terminal.onVTKeystroke('~');
      return;
    }
    if ((e.code === 'IntlBackslash' || e.code === 'Backquote') && e.shiftKey === false) {
      this.terminal.onVTKeystroke('`');
      return;
    }
    if (e.code === 'Digit6') {
      this.terminal.onVTKeystroke('^');
      return;
    }
    // German keyboard layout
    if (e.code === 'Equal' && e.shiftKey === false) {
      this.terminal.onVTKeystroke('´');
      return;
    }
    if (e.code === 'Equal' && e.shiftKey === true) {
      this.terminal.onVTKeystroke('`');
      return;
    }
    // Italian keyboard layout
    if (e.code === 'Digit9' && e.altKey === true && modifierKeysConf.altIsMeta === false) {
      this.terminal.onVTKeystroke('`');
      return;
    }
    if (e.code === 'Digit8' && e.altKey === true && modifierKeysConf.altIsMeta === false) {
      this.terminal.onVTKeystroke('´');
      // To fix issue with changing the terminal prompt
      e.preventDefault();
      return;
    }
    // French keyboard layout
    if (e.code === 'BracketLeft') {
      this.terminal.onVTKeystroke('^');
      return;
    }
    if (e.code === 'Backslash') {
      this.terminal.onVTKeystroke('`');
      return;
    }
    console.warn('Uncaught dead key on international keyboard', e);
  }

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
  if ((!e.ctrlKey || e.code !== 'ControlLeft') && !e.shiftKey && e.code !== 'CapsLock') {
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
