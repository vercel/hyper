const { app, BrowserWindow, shell, Menu } = require('electron');
const createRPC = require('./rpc');
const createMenu = require('./menu');
const Session = require('./session');
const genUid = require('uid2');
const { resolve } = require('path');
const isDev = require('electron-is-dev');
const AutoUpdater = require('./auto-updater');
const toHex = require('convert-css-color-name-to-hex');

// set up config
const config = require('./config');
config.init();
const plugins = require('./plugins');

// expose to plugins
app.config = config;
app.plugins = plugins;

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
let win;

app.on('ready', () => {
  function createWindow (fn) {
    const cfg = plugins.getDecoratedConfig();

    win = new BrowserWindow({
      width: 540,
      height: 380,
      minHeight: 190,
      minWidth: 370,
      titleBarStyle: 'hidden-inset',
      title: 'HyperTerm',
      backgroundColor: toHex(cfg.backgroundColor || '#000'),
      transparent: true,
      // we only want to show when the prompt
      // is ready for user input
      show: process.env.HYPERTERM_DEBUG || isDev
    });

    winCount++;
    win.loadURL(url);

    const rpc = createRPC(win);
    const sessions = new Map();

    // config changes
    const cfgUnsubscribe = config.subscribe(() => {
      win.webContents.send('config change');
    });

    rpc.on('init', () => {
      win.show();

      // auto updates
      if (!isDev) {
        AutoUpdater(win);
      } else {
        console.log('ignoring auto updates during dev');
      }
    });

    rpc.on('new', ({ rows = 40, cols = 100 }) => {
      initSession({ rows, cols }, (uid, session) => {
        sessions.set(uid, session);

        rpc.emit('session add', {
          uid,
          shell: session.shell
        });

        session.on('data', (data) => {
          rpc.emit('session data', { uid, data });
        });

        session.on('title', (title) => {
          rpc.emit('session title', { uid, title });
        });

        session.on('exit', () => {
          rpc.emit('session exit', { uid });
          sessions.delete(uid);
        });
      });
    });

    // TODO: this goes away when we are able to poll
    // for the title ourseleves, instead of relying
    // on Session and focus/blur to subscribe
    rpc.on('focus', ({ uid }) => {
      const session = sessions.get(uid);

      if (session) {
        session.focus();
      } else {
        console.log('session not found by', uid);
      }
    });

    rpc.on('blur', ({ uid }) => {
      const session = sessions.get(uid);

      if (session) {
        session.blur();
      } else {
        console.log('session not found by', uid);
      }
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

    // expose internals to extension authors
    win.rpc = rpc;
    win.sessions = sessions;

    const load = () => {
      plugins.onWindow(win);
    };

    // load plugins
    load();

    const pluginsUnsubscribe = plugins.subscribe((err) => {
      if (!err) {
        load();
        win.webContents.send('plugins change');
      }
    });

    // the window can be closed by the browser process itself
    win.on('close', () => {
      winCount--;
      rpc.destroy();
      deleteSessions();
      cfgUnsubscribe();
      pluginsUnsubscribe();
    });
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

  const setupMenu = () => {
    const tpl = plugins.decorateMenu(createMenu({
      createWindow,
      updatePlugins: () => {
        plugins.updatePlugins({ force: true });
      },
      mainWindow: win
    }));

    Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
  };

  const load = () => {
    plugins.onApp(app);
    setupMenu();
  };

  load();
  plugins.subscribe(load);
});

function initSession (opts, fn) {
  genUid(20, (err, uid) => {
    if (err) throw err;
    fn(uid, new Session(opts));
  });
}
