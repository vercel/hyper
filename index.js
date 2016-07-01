const { app, BrowserWindow, Menu } = require('electron');
const createRPC = require('./rpc');
const Session = require('./session');
const genUid = require('uid2');
const { resolve } = require('path');

if ('development' === process.env.NODE_ENV) {
  console.log('initializing in dev mode (NODE_ENV)');
} else {
  console.log('initializing in prod mode (NODE_ENV)');
}

app.on('window-all-closed', () => {
  // by subscribing to this event and nooping
  // we prevent electron's default behavior
  // of quitting the app when the last
  // terminal is closed
});

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
      show: 'development' === process.env.NODE_ENV
    });

    win.loadURL('file://' + resolve(__dirname, 'app', 'index.html'));

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
    });

    win.rpc = rpc;
  }

  // when opening create a new window
  createWindow();

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
