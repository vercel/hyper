const {app} = require('electron');
const isDev = require('electron-is-dev');
const AutoUpdater = require('../../auto-updater');
const fetchNotifications = require('../../notifications');
const toElectronBackgroundColor = require('../utils/to-electron-background-color');

module.exports = (win, cfg, fn) => {
  win.setBackgroundColor(toElectronBackgroundColor(cfg.backgroundColor || '#000'));
  win.show();
  // If no callback is passed to createWindow,
  // a new session will be created by default.
  if (!fn) {
    fn = open => open.rpc.emit('termgroup add req');
  }
  // app.windowCallback is the createWindow callback
  // that can be set before the 'ready' app event
  // and createWindow deifinition. It's executed in place of
  // the callback passed as parameter, and deleted right after.
  (app.windowCallback || fn)(win);
  delete (app.windowCallback);
  fetchNotifications(win);
  // auto updates
  if (!isDev && process.platform !== 'linux') {
    AutoUpdater(win);
  } else {
    console.log('ignoring auto updates during dev');
  }
};
