const { app, BrowserWindow, shell, Menu } = require('electron');
const createRPC = require('./rpc');
const createMenu = require('./menu');
const Session = require('./session');
const genUid = require('uid2');
const { resolve } = require('path');
const isDev = require('electron-is-dev');
const AutoUpdater = require('./auto-updater');

if (isDev) {
  console.log('running in dev mode');
} else {
  console.log('running in prod mode');
}

const url = 'file://' + resolve(
  isDev ? __dirname : app.getAppPath(),
  // in prod version, we copy over index.html and dist from 'app'
  // into one dist folder to avoid unwanted files in package
  isDev ? 'app' : 'build',
  'index.html'
);

console.log('electron will open', url);

app.on('window-all-closed', () => {
  // by subscribing to this event and nooping
  // we prevent electron's default behavior
  // of quitting the app when the last
  // terminal is closed
});

let winCount = 0;

app.on('ready', () => {
  function createWindow (fn) {
    let win = new BrowserWindow({
      width: 540,
      height: 380,
      titleBarStyle: 'hidden',
      title: 'HyperTerm',
      backgroundColor: '#000',
      transparent: true,
      // we only want to show when the prompt
      // is ready for user input
      show: process.env.HYPERTERM_DEBUG || isDev
    });
    winCount++;
    win.loadURL(url);

    const rpc = createRPC(win);
    const sessions = new Map();

    rpc.on('init', () => {
      win.show();
    });

    rpc.on('new', ({ rows = 40, cols = 100 }) => {
      initSession({ rows, cols }, (uid, session) => {
        sessions.set(uid, session);
        rpc.emit('new session', { uid });

        AutoUpdater(rpc);

        session.on('data', (data) => {
          rpc.emit('data', { uid, data });
        });

        session.on('title', (title) => {
          rpc.emit('title', { uid, title });
        });

        session.on('exit', () => {
          rpc.emit('exit', { uid });
          sessions.delete(uid);
        });
      });
    });

    rpc.on('focus', ({ uid }) => {
      sessions.get(uid).focus();
    });

    rpc.on('blur', ({ uid }) => {
      sessions.get(uid).blur();
    });

    rpc.on('exit', ({ uid }) => {
      sessions.get(uid).exit();
    });

    rpc.on('unmaximize', () => {
      win.unmaximize();
    });

    rpc.on('maximize', () => {
      win.maximize();
    });

    rpc.on('resize', ({ cols, rows }) => {
      sessions.forEach((session) => {
        session.resize({ cols, rows });
      });
    });

    rpc.on('data', ({ uid, data }) => {
      sessions.get(uid).write(data);
    });

    rpc.on('open external', ({ url }) => {
      shell.openExternal(url);
    });

    const deleteSessions = () => {
      sessions.forEach((session, key) => {
        session.removeAllListeners();
        session.destroy();
        sessions.delete(key);
      });
    };

    // we reset the rpc channel only upon
    // subsequent refreshes (ie: F5)
    let i = 0;
    win.webContents.on('did-navigate', () => {
      if (i++) {
        deleteSessions();
      }
    });

    // the window can be closed by the browser process itself
    win.on('close', () => {
      rpc.destroy();
      deleteSessions();
      winCount--;
    });

    win.rpc = rpc;
  }

  // when opening create a new window
  createWindow();

  // mac only. when the dock icon is clicked
  // and we don't have any active windows open,
  // we open one
  app.on('activate', () => {
    if (!winCount) {
      createWindow();
    }
  });

  // set menu
  const tpl = createMenu({ createWindow });
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
});

function initSession (opts, fn) {
  genUid(20, (err, uid) => {
    if (err) throw err;
    fn(uid, new Session(opts));
  });
}
