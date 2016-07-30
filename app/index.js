const { app, BrowserWindow, shell, Menu } = require('electron');
const createRPC = require('./rpc');
const createMenu = require('./menu');
const uuid = require('uuid');
const { resolve } = require('path');
const isDev = require('electron-is-dev');
const AutoUpdater = require('./auto-updater');
const toHex = require('convert-css-color-name-to-hex');
const notify = require('./notify');

app.commandLine.appendSwitch('js-flags', '--harmony');

// set up config
const config = require('./config');
config.init();
const plugins = require('./plugins');
const Session = require('./session');

const windowSet = new Set([]);

// expose to plugins
app.config = config;
app.plugins = plugins;
app.getWindows = () => new Set([...windowSet]); // return a clone

if (isDev) {
  console.log('running in dev mode');
} else {
  console.log('running in prod mode');
}

const url = 'file://' + resolve(
  isDev ? __dirname : app.getAppPath(),
  'index.html'
);

console.log('electron will open', url);

app.on('ready', () => {
  function createWindow (fn) {
    let cfg = plugins.getDecoratedConfig();

    const [width, height] = cfg.windowSize || [540, 380];

    let startX = 50;
    let startY = 50;

    // Open the new window roughly the height of the header away from the
    // previous window. This also ensures in multi monitor setups that the
    // new terminal is on the correct screen.
    if (BrowserWindow.getFocusedWindow() !== null) {
      const currentWindow = BrowserWindow.getFocusedWindow();
      const points = currentWindow.getPosition();
      startX = points[0] + 34;
      startY = points[1] + 34;
    }

    const browserDefaults = {
      width,
      height,
      minHeight: 190,
      minWidth: 370,
      titleBarStyle: 'hidden-inset',
      title: 'HyperTerm',
      backgroundColor: toHex(cfg.backgroundColor || '#000'),
      transparent: true,
      icon: resolve(__dirname, 'static/icon.png'),
      // we only want to show when the prompt
      // is ready for user input
      show: process.env.HYPERTERM_DEBUG || isDev,
      x: startX,
      y: startY
    };
    const browserOptions = plugins.getDecoratedBrowserOptions(browserDefaults);

    const win = new BrowserWindow(browserOptions);

    windowSet.add(win);
    win.loadURL(url);

    const rpc = createRPC(win);
    const sessions = new Map();

    // config changes
    const cfgUnsubscribe = config.subscribe(() => {
      const cfg_ = plugins.getDecoratedConfig();

      win.webContents.send('config change');

      if (cfg_.shell !== cfg.shell) {
        notify(
          'Shell configuration changed!',
          'Open a new tab or window to start using the new shell'
        );
      }

      cfg = cfg_;
    });

    rpc.on('init', () => {
      win.show();
      if (fn) fn(win);

      // auto updates
      if (!isDev && process.platform !== 'linux') {
        AutoUpdater(win);
      } else {
        console.log('ignoring auto updates during dev');
      }
    });

    rpc.on('new', ({ rows = 40, cols = 100, cwd = process.env.HOME }) => {
      const shell = cfg.shell;

      initSession({ rows, cols, cwd, shell }, (uid, session) => {
        sessions.set(uid, session);
        rpc.emit('session add', {
          uid,
          shell: session.shell,
          pid: session.pty.pid
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
      const session = sessions.get(uid);

      if (session) {
        session.exit();
      } else {
        console.log('session not found by', uid);
      }
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

    rpc.win.on('move', () => {
      rpc.emit('move');
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
      windowSet.delete(win);
      rpc.destroy();
      deleteSessions();
      cfgUnsubscribe();
      pluginsUnsubscribe();
    });

    win.on('closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  // when opening create a new window
  createWindow();

  // expose to plugins
  app.createWindow = createWindow;

  // mac only. when the dock icon is clicked
  // and we don't have any active windows open,
  // we open one
  app.on('activate', () => {
    if (!windowSet.size) {
      createWindow();
    }
  });

  const setupMenu = () => {
    const tpl = plugins.decorateMenu(createMenu({
      createWindow,
      updatePlugins: () => {
        plugins.updatePlugins({ force: true });
      }
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
  fn(uuid.v4(), new Session(opts));
}
