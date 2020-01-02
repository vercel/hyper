import {resolve} from 'path';
import {app, BrowserWindow} from 'electron';
import isDev from 'electron-is-dev';

let win: BrowserWindow;

// the hack of all hacks
// electron doesn't have a built in notification thing,
// so we launch a window on which we can use the
// HTML5 `Notification` API :'(

let buffer: string[][] = [];

function notify(title: string, body = '', details: any = {}) {
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

app.on('ready', () => {
  const win_ = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  const url = `file://${resolve(isDev ? __dirname : app.getAppPath(), 'notify.html')}`;
  win_.loadURL(url);
  win_.webContents.on('dom-ready', () => {
    win = win_;
    buffer.forEach(([title, body]) => {
      notify(title, body);
    });
    buffer = [];
  });
});

export default notify;
