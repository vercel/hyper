import { hterm, lib } from 'hterm-umdjs';

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
  if (e.metaKey) {
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

export { hterm };
export { lib };
