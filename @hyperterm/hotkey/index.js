'use strict';

const Hotkey = require('./hotkey');

let hotkey = new Hotkey();

module.exports.onWindow = function handleNewVisorWindow (win) {
  hotkey.registerWindow(win);
};

module.exports.onApp = function registerGlobalHotkey (app) {
  hotkey.setConfig(app.config.getConfig() || {});
};

module.exports.onUnload = function unregisterGlobalHotkey () {
  hotkey.destroy();
};
