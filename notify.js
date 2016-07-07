const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const { resolve } = require('path');

let win;

// the hack of all hacks
// electron doesn't have a built in notification thing,
// so we launch a window on which we can use the
// HTML5 `Notification` API :'(

app.on('ready', () => {
  const win_ = new BrowserWindow({
    show: false
  });
  const url = 'file://' + resolve(
    isDev ? __dirname : app.getAppPath(),
    'notify.html'
  );
  win_.loadURL(url);
  win = win_;
});

module.exports = function notify (title, body) {
  if (win) {
    win.webContents.send('notification', { title, body });
  }
  // TODO: buffer ?
};
