const { app, BrowserWindow, shell, Menu } = require('electron');
const createRPC = require('./rpc');
const Session = require('./session');
const genUid = require('uid2');
const { resolve } = require('path');
const isDev = require('electron-is-dev');

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

        session.on('data', (data) => {
          rpc.emit('data', { uid, data });
        });

        session.on('title', (title) => {
          rpc.emit('title', { uid, title });
        });

        session.on('exit', () => {
          rpc.emit('exit', { uid });
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

    rpc.on('fullscreen', () => {
      win.setFullScreen(!win.isFullScreen());
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
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: 'Application',
      submenu: [
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'Shell',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click (item, focusedWindow) {
            createWindow();
          }
        },
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('new tab');
            } else {
              createWindow();
            }
          }
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('close tab');
            }
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload();
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Select Previous Tab',
          accelerator: 'CmdOrCtrl+Left',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('move left');
            }
          }
        },
        {
          label: 'Select Next Tab',
          accelerator: 'CmdOrCtrl+Right',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('move right');
            }
          }
        },
        {
          label: 'Fullscreen',
          accelerator: 'Ctrl+Cmd+F',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('fullscreen');
            }
          }
        }
      ]
    }
  ]));
});

function initSession (opts, fn) {
  genUid(20, (err, uid) => {
    if (err) throw err;
    fn(uid, new Session(opts));
  });
}
