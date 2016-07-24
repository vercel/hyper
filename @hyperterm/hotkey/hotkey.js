'use strict';

const electron = require('electron');
const remove = require('lodash.remove');
const { globalShortcut } = electron;

module.exports = class Hotkey {
  constructor () {
    this.windows = [];
    this.config = {};
  }

  setConfig (config = {}) {
    this.unregisterGlobalHotkey();
    this.config = config;
    this.registerGlobalHotkey();
  }

  registerGlobalHotkey () {
    if (typeof this.config.hotkey !== 'string') return;

    globalShortcut.register(this.config.hotkey, () => this.toggleWindow());
  }

  unregisterGlobalHotkey () {
    if (typeof this.config.hotkey !== 'string') return;

    globalShortcut.unregister(this.config.hotkey);
  }

  toggleWindow () {
    let allHidden = true;

    for (let i = 0; i < this.windows.length; i++) {
      if (this.windows[i].isVisible()) {
        allHidden = false;
      }
    }

    // We disable focus detection when programatically transitioning
    this.transitioning = true;

    for (let i = 0; i < this.windows.length; i++) {
      if (allHidden) {
        this.windows[i].show();

        if (i === this.windows.length - 1) {
          this.windows[i].focus();
        }
      } else {
        this.windows[i].hide();
      }
    }

    this.transitioning = false;
  }

  registerWindow (win) {
    const onClose = () => {
      remove(this.windows, { id: win.id });
    };

    const onFocus = () => {
      // Ignore focus event when programmatically showing / hiding
      if (!this.transitioning) {
        // Move focused window on top of the stack
        remove(this.windows, { id: win.id });
        this.windows.push(win);
      }
    };

    win.on('close', onClose);
    win.on('focus', onFocus);

    this.windows.push(win);
  }

  destroy () {
    this.unregisterGlobalHotkey();
  }
};
