const {resolve} = require('path');

const {app, BrowserWindow} = require('electron');
const isDev = require('electron-is-dev');

let win;

// the hack of all hacks
// electron doesn't have a built in notification thing,
// so we launch a window on which we can use the
// HTML5 `Notification` API :'(

let buffer = [];

app.on('ready', () => {
  const win_ = new BrowserWindow({
    show: false
  });
  const url = 'file://' + resolve(isDev ? __dirname : app.getAppPath(), 'notify.html');
  win_.loadURL(url);
  win_.webContents.on('dom-ready', () => {
    win = win_;
    buffer.forEach(([title, body]) => {
      notify(title, body);
    });
    buffer = null;
  });
});

function notify(title, body, details = {}) {
  //eslint-disable-next-line no-console
  console.log(`[Notification] ${title}: ${body}`);
  if (details.error) {
    //eslint-disable-next-line no-console
    console.error(details.error);
  }
  if (win) {
    win.webContents.send('notification', {title, body});
  } else {
    buffer.push([title, body]);
  }
}

module.exports = notify;
