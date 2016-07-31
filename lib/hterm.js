import { hterm, lib } from 'hterm-umdjs';
const unicodeStringUtils = require('unicode-string-utils');

hterm.defaultStorage = new lib.Storage.Memory();

// override double click behavior to copy
const oldMouse = hterm.Terminal.prototype.onMouse_;
hterm.Terminal.prototype.onMouse_ = function (e) {
  if ('dblclick' === e.type) {
    console.log('[hyperterm+hterm] ignore double click');
    return;
  }
  return oldMouse.call(this, e);
};

function containsNonLatinCodepoints (s) {
  return /[^\u0000-\u00ff]/.test(s);
}

/**
 * We need to split the string up into Unicode char points first, then
 * we can style them later within the containers.
 */
const oldInsertString = hterm.Screen.prototype.insertString;
hterm.Screen.prototype.insertString = function (str) {
  if (containsNonLatinCodepoints(str)) {
    let length = unicodeStringUtils.length(str);
    var cursorNode = this.cursorNode_;
    // var cursorNodeText = cursorNode.textContent;

    this.cursorRowNode_.removeAttribute('line-overflow');
    // var offset = this.cursorOffset_;

    if (unicodeStringUtils.length(str) > 1) {
      for (var char = 0; char < length; char++) {
          // oldInsertString.call(this, unicodeStringUtils.slice(str, char, char + 1));
          // Worst case, we're somewhere in the middle of the cursor node.  We'll
          // have to split it into two nodes and insert our new container in between.

        var newNode = this.textAttributes.createContainer(unicodeStringUtils.slice(str, char, char + 1));
        this.cursorRowNode_.insertBefore(newNode, cursorNode.nextSibling);
      }
      this.cursorNode_ = newNode;
      this.cursorPosition.column += length;
      this.cursorOffset_ = length;

      return;
    }
  }
  return oldInsertString.call(this, str);
};

const oldCreateContainer = hterm.TextAttributes.prototype.createContainer;
hterm.TextAttributes.prototype.createContainer = function (text) {
  const container = oldCreateContainer.call(this, text);
  // @TODO: Measure the actual width
  if (containsNonLatinCodepoints(text) && unicodeStringUtils.length(text) === 1) {
    container.style.width = '7px';
    container.style.display = 'inline-block';
  }
  return container;
};

// there's no option to turn off the size overlay
hterm.Terminal.prototype.overlaySize = function () {};

// fixing a bug in hterm where a double click triggers
// a non-collapsed selection whose text is '', and results
// in an infinite copy loop
hterm.Terminal.prototype.copySelectionToClipboard = function () {
  var text = this.getSelectionText();
  if (text != null && text !== '') {
    this.copyStringToClipboard(text);
  }
};

// passthrough all the commands that are meant to control
// hyperterm and not the terminal itself
const oldKeyDown = hterm.Keyboard.prototype.onKeyDown_;
hterm.Keyboard.prototype.onKeyDown_ = function (e) {
  if (e.metaKey || e.altKey) {
    return;
  }
  return oldKeyDown.call(this, e);
};

const oldKeyPress = hterm.Keyboard.prototype.onKeyPress_;
hterm.Keyboard.prototype.onKeyPress_ = function (e) {
  if (e.metaKey) {
    return;
  }
  return oldKeyPress.call(this, e);
};

// we re-implement `wipeContents` to preserve the line
// and cursor position that the client is in.
// otherwise the user ends up with a completely clear
// screen which is really strange
hterm.Terminal.prototype.clearPreserveCursorRow = function () {
  this.scrollbackRows_.length = 0;
  this.scrollPort_.resetCache();

  [this.primaryScreen_, this.alternateScreen_].forEach((screen) => {
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

// fixes a bug in hterm, where the shorthand hex
// is not properly converted to rgb
lib.colors.hexToRGB = function (arg) {
  var hex16 = lib.colors.re_.hex16;
  var hex24 = lib.colors.re_.hex24;

  function convert (hex) {
    if (hex.length === 4) {
      hex = hex.replace(hex16, function (h, r, g, b) {
        return '#' + r + r + g + g + b + b;
      });
    }
    var ary = hex.match(hex24);
    if (!ary) return null;

    return 'rgb(' +
      parseInt(ary[1], 16) + ', ' +
      parseInt(ary[2], 16) + ', ' +
      parseInt(ary[3], 16) +
    ')';
  }

  if (arg instanceof Array) {
    for (var i = 0; i < arg.length; i++) {
      arg[i] = convert(arg[i]);
    }
  } else {
    arg = convert(arg);
  }

  return arg;
};

export default hterm;
export { lib };
