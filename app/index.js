const { app, BrowserWindow, shell, Menu } = require('electron');
const createRPC = require('./rpc');
const createMenu = require('./menu');
const uuid = require('uuid');
const { resolve } = require('path');
const { parse: parseUrl } = require('url');
const fileUriToPath = require('file-uri-to-path');
const isDev = require('electron-is-dev');
const AutoUpdater = require('./auto-updater');
const toElectronBackgroundColor = require('./utils/to-electron-background-color');
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

// function to retrive the last focused window in windowSet;
// added to app object in order to expose it to plugins.
app.getLastFocusedWindow = () => {
  if (!windowSet.size) return null;
  return Array.from(windowSet).reduce((lastWindow, win) => {
    return win.focusTime > lastWindow.focusTime ? win : lastWindow;
  });
};

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
    const { screen } = require('electron');

    let startX = 50;
    let startY = 50;

    // Open the new window roughly the height of the header away from the
    // previous window. This also ensures in multi monitor setups that the
    // new terminal is on the correct screen.
    const focusedWindow = BrowserWindow.getFocusedWindow() || app.getLastFocusedWindow();
    if (focusedWindow) {
      const points = focusedWindow.getPosition();
      const currentScreen = screen.getDisplayNearestPoint({ x: points[0], y: points[1] });

      const biggestX = ((points[0] + 100 + width) - currentScreen.bounds.x);
      const biggestY = ((points[1] + 100 + height) - currentScreen.bounds.y);

      if (biggestX > currentScreen.size.width) {
        startX = 50;
      } else {
        startX = points[0] + 34;
      }
      if (biggestY > currentScreen.size.height) {
        startY = 50;
      } else {
        startY = points[1] + 34;
      }
    }

    const browserDefaults = {
      width,
      height,
      minHeight: 190,
      minWidth: 370,
      titleBarStyle: 'hidden-inset',
      title: 'HyperTerm',
      backgroundColor: toElectronBackgroundColor(cfg.backgroundColor || '#000'),
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

      // notify renderer
      win.webContents.send('config change');

      // notify user that shell changes require new sessions
      if (cfg_.shell !== cfg.shell || cfg_.shellArgs !== cfg.shellArgs) {
        notify(
          'Shell configuration changed!',
          'Open a new tab or window to start using the new shell'
        );
      }

      // update background color if necessary
      win.setBackgroundColor(toElectronBackgroundColor(cfg_.backgroundColor || '#000'));

      cfg = cfg_;
    });

    rpc.on('init', () => {
      win.show();

      // If no callback is passed to createWindow,
      // a new session will be created by default.
      if (!fn) fn = (win) => win.rpc.emit('session add req');

      // app.windowCallback is the createWindow callback
      // that can be setted before the 'ready' app event
      // and createWindow deifinition. It's exeuted in place of
      // the callback passed as parameter, and deleted right after.
      (app.windowCallback || fn)(win);
      delete (app.windowCallback);

      // auto updates
      if (!isDev && process.platform !== 'linux') {
        AutoUpdater(win);
      } else {
        console.log('ignoring auto updates during dev');
      }
    });

    rpc.on('new', ({ rows = 40, cols = 100, cwd = process.env.HOME }) => {
      const shell = cfg.shell;
      const shellArgs = cfg.shellArgs && Array.from(cfg.shellArgs);

      initSession({ rows, cols, cwd, shell, shellArgs }, (uid, session) => {
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
          win.setTitle(title);
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
      if (typeof session !== 'undefined' && typeof session.lastTitle !== 'undefined') {
        win.setTitle(session.lastTitle);
      }
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

    // If file is dropped onto the terminal window, navigate event is prevented
    // and his path is added to active session.
    win.webContents.on('will-navigate', (event, url) => {
      var protocol = typeof url === 'string' && parseUrl(url).protocol;
      if (protocol === 'file:') {
        event.preventDefault();
        let path = fileUriToPath(url).replace(/ /g, '\\ ');
        rpc.emit('session data send', { data: path });
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

    // Keep track of focus time of every window, to figure out
    // which one of the existing window is the last focused.
    // Works nicely even if a window is closed and removed.
    const updateFocusTime = () => {
      win.focusTime = process.uptime();
    };
    win.on('focus', () => {
      updateFocusTime();
    });
    // Ensure focusTime is set on window open. The focus event doesn't
    // fire from the dock (see bug #583)
    updateFocusTime();

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

    // If we're on Mac make a Dock Menu
    if (process.platform === 'darwin') {
      const { app, Menu } = require('electron');
      const dockMenu = Menu.buildFromTemplate([
        {label: 'New Window', click () { createWindow(); }}
      ]);
      app.dock.setMenu(dockMenu);
    }

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

app.on('open-file', (event, path) => {
  const lastWindow = app.getLastFocusedWindow();
  const callback = win => win.rpc.emit('open file', { path });
  if (lastWindow) {
    callback(lastWindow);
  } else if (!lastWindow && app.hasOwnProperty('createWindow')) {
    app.createWindow(callback);
  } else {
    // if createWindow not exists yet ('ready' event was not fired),
    // sets his callback to an app.windowCallback property.
    app.windowCallback = callback;
  }
});
