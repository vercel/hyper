const { app, BrowserWindow, shell, Menu } = require('electron');
const createRPC = require('./rpc');
const createMenu = require('./menu');
const Session = require('./session');
const genUid = require('uid2');
const { resolve } = require('path');
const isDev = require('electron-is-dev');
const AutoUpdater = require('./auto-updater');

// set up config
const config = require('./config');
config.init();
const plugins = require('./plugins');

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
      titleBarStyle: 'hidden-inset',
      title: 'HyperTerm',
      backgroundColor: config.getConfig().backgroundColor || '#000',
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
        rpc.emit('new session', { uid });

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

    // expose internals to extension authors
    win.rpc = rpc;
    win.sessions = sessions;

    const load = () => {
      plugins.onWindow(win);
    };

    // load plugins
    load();

    const pluginsUnsubscribe = plugins.subscribe(() => {
      load();
      win.webContents.send('plugins change');
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
      updatePlugins: plugins.updatePlugins
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
