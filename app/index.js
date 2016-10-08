  // Native
const {resolve} = require('path');

// Packages
const {parse: parseUrl} = require('url');
const {app, BrowserWindow, shell, Menu} = require('electron');
const {gitDescribe} = require('git-describe');
const uuid = require('uuid');
const fileUriToPath = require('file-uri-to-path');
const isDev = require('electron-is-dev');

// Ours
const AutoUpdater = require('./auto-updater');
const toElectronBackgroundColor = require('./utils/to-electron-background-color');
const createMenu = require('./menu');
const createRPC = require('./rpc');
const notify = require('./notify');
const fetchNotifications = require('./notifications');

app.commandLine.appendSwitch('js-flags', '--harmony');

// set up config
const config = require('./config');
// set up record
const record = require('./record');

config.init();

const plugins = require('./plugins');
const Session = require('./session');

const Window = require('./window');

const windowSet = new Set([]);

// expose to plugins
app.config = config;
app.plugins = plugins;
app.getWindows = () => new Set([...windowSet]); // return a clone

// function to retrieve the last focused window in windowSet;
// added to app object in order to expose it to plugins.
app.getLastFocusedWindow = () => {
  if (!windowSet.size) {
    return null;
  }
  return Array.from(windowSet).reduce((lastWindow, win) => {
    return win.focusTime > lastWindow.focusTime ? win : lastWindow;
  });
};

if (isDev) {
  console.log('running in dev mode');

  // Overide default appVersion which is set from package.json
  gitDescribe({customArguments: ['--tags']}, (error, gitInfo) => {
    if (!error) {
      app.setVersion(gitInfo.raw);
    }
  });
} else {
  console.log('running in prod mode');
}

const url = 'file://' + resolve(
  isDev ? __dirname : app.getAppPath(),
  'index.html'
);

console.log('electron will open', url);

app.on('ready', () => installDevExtensions(isDev).then(() => {
  function createWindow(fn, options = {}) {
    let cfg = plugins.getDecoratedConfig();

    const winSet = app.config.window.get();
    let [startX, startY] = winSet.position;

    const [width, height] = options.size ? options.size : (cfg.windowSize || winSet.size);
    const {screen} = require('electron');

    const winPos = options.position;

    // Open the new window roughly the height of the header away from the
    // previous window. This also ensures in multi monitor setups that the
    // new terminal is on the correct screen.
    const focusedWindow = BrowserWindow.getFocusedWindow() || app.getLastFocusedWindow();
    // In case of options defaults position and size, we should ignore the focusedWindow.
    if (winPos !== undefined) {
      [startX, startY] = winPos;
    } else if (focusedWindow) {
      const points = focusedWindow.getPosition();
      const currentScreen = screen.getDisplayNearestPoint({x: points[0], y: points[1]});

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
      title: 'Hyper.app',
      backgroundColor: toElectronBackgroundColor(cfg.backgroundColor || '#000'),
      transparent: true,
      icon: resolve(__dirname, 'static/icon.png'),
      // we only want to show when the prompt is ready for user input
      // HYPERTERM_DEBUG for backwards compatibility with hyperterm
      show: process.env.HYPER_DEBUG || process.env.HYPERTERM_DEBUG || isDev,
      x: startX,
      y: startY
    };

    const browserOptions = plugins.getDecoratedBrowserOptions(browserDefaults);

    const win = new Window(browserOptions);
    windowSet.add(win);

    win.loadURL(url);

    const rpc = createRPC(win);
    const sessions = new Map();
    
    win.setRpc(rpc);
    
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
      console.log('init');
      win.show();

      // If no callback is passed to createWindow,
      // a new session will be created by default.
      if (!fn) {
        fn = win => win.rpc.emit('termgroup add req init');
      }

      // app.windowCallback is the createWindow callback
      // that can be set before the 'ready' app event
      // and createWindow deifinition. It's executed in place of
      // the callback passed as parameter, and deleted right after.
      (app.windowCallback || fn)(win);
      delete (app.windowCallback);

      fetchNotifications(win);
      // auto updates
      if (!isDev && process.platform !== 'linux') {
        AutoUpdater(win);
      } else {
        console.log('ignoring auto updates during dev');
      }

      // record.pushWin(win);
    });
    
    rpc.on('createTab', ({rows = 40, cols = 100, cwd = process.env.HOME}) => {
      const shell = cfg.shell;
      const shellArgs = cfg.shellArgs && Array.from(cfg.shellArgs); 
      
      win.createTab({rows, cols, cwd, shell, shellArgs}); 
    });
    
    rpc.on('termSplit', ({rows = 40, cols = 100, cwd = process.env.HOME, splitDirection, activeUid}) => {
      const shell = cfg.shell;
      const shellArgs = cfg.shellArgs && Array.from(cfg.shellArgs); 
      
      const element = win.get(activeUid);
      element.split({rows, cols, cwd, shell, shellArgs, splitDirection, activeUid}, win);
    });

    rpc.on('exit', ({uid}) => {
      const session = win.get(uid).session;
      if(session) {
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

    rpc.on('resize', ({uid, cols, rows}) => {
      const session = win.get(uid).session;
      session.resize({cols, rows});
    });

    rpc.on('data', ({uid, data}) => {
      const session = win.get(uid).session;
      session.write(data);
    });

    rpc.on('open external', ({url}) => {
      shell.openExternal(url);
    });

    rpc.win.on('move', () => {
      rpc.emit('move');
    });

    // we reset the rpc channel only upon
    // subsequent refreshes (ie: F5)
    let i = 0;
    win.webContents.on('did-navigate', () => {
      if (i++) {
        win.removeElements();
      }
    });

    // If file is dropped onto the terminal window, navigate event is prevented
    // and his path is added to active session.
    win.webContents.on('will-navigate', (event, url) => {
      const protocol = typeof url === 'string' && parseUrl(url).protocol;
      if (protocol === 'file:') {
        event.preventDefault();
        const path = fileUriToPath(url).replace(/ /g, '\\ ');
        rpc.emit('session data send', {data: path});
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

    const pluginsUnsubscribe = plugins.subscribe(err => {
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
      app.config.window.recordState(win);
      windowSet.delete(win);
      rpc.destroy();
      win.removeElements();
      cfgUnsubscribe();
      pluginsUnsubscribe();
    });

    win.on('closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  // restore previous saved state
  // record.load(reccords => {
  //   if (reccords.length > 0) {
  //     reccords.forEach(reccord => {
  //       createWindow(undefined, {
  //         position: reccord.position,
  //         size: reccord.size
  //       });
  //         // rpc.emit('termgroup add req');
  //     });
  //   } else {
  //     // when no reccords
  //     // when opening create a new window
  createWindow();
  //   }
  //
  //   // start save scheduler
    record.save(windowSet);
  // });

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
        plugins.updatePlugins({force: true});
      }
    }));

    // If we're on Mac make a Dock Menu
    if (process.platform === 'darwin') {
      const dockMenu = Menu.buildFromTemplate([{
        label: 'New Window',
        click() {
          createWindow();
        }
      }]);
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
}).catch(err => {
  console.error('Error while loading devtools extensions', err);
}));

function initSession(opts, fn) {
  fn(uuid.v4(), new Session(opts));
}

app.on('open-file', (event, path) => {
  const lastWindow = app.getLastFocusedWindow();
  const callback = win => win.rpc.emit('open file', {path});
  if (lastWindow) {
    callback(lastWindow);
  } else if (!lastWindow && {}.hasOwnProperty.call(app, 'createWindow')) {
    app.createWindow(callback);
  } else {
    // If createWindow doesn't exist yet ('ready' event was not fired),
    // sets his callback to an app.windowCallback property.
    app.windowCallback = callback;
  }
});

function installDevExtensions(isDev) {
  if (!isDev) {
    return Promise.resolve();
  }
  // eslint-disable-next-line import/no-extraneous-dependencies
  const installer = require('electron-devtools-installer');

  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];
  const forceDownload = Boolean(process.env.UPGRADE_EXTENSIONS);

  return Promise.all(extensions.map(name => installer.default(installer[name], forceDownload)));
}
