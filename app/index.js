  // Native
const {resolve} = require('path');

// Packages
const {app, BrowserWindow, shell, Menu} = require('electron');
const {gitDescribe} = require('git-describe');
const uuid = require('uuid');
const isDev = require('electron-is-dev');

// Ours
const toElectronBackgroundColor = require('./utils/to-electron-background-color');
const createMenu = require('./menu');
const createRPC = require('./rpc');

app.commandLine.appendSwitch('js-flags', '--harmony');

// set up config
const config = require('./config');

// set up record
const record = require('./record');

config.init();

const plugins = require('./plugins');
const Session = require('./session');

const Window = require('./window');

// expose to plugins
app.config = config;
app.plugins = plugins;

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

    const win = new Window(browserOptions, cfg, fn);

    win.loadURL(url);
  }
  
  // restore previous saved state
  // record.load(reccords => {
  //   if (reccords.length > 0) {
  //     reccords.forEach(reccord => {
  //       console.log(reccord);
  //       createWindow(win => {
  //         reccord.tabs.forEach(tab => {
  //           console.log(tab);
  //           win.rpc.emit('termgroup load req', {uid:tab.uid});
  //           // tab.splits.forEach(split => {
  //             // console.log(split);
  //             // if(split) {
  //             //   if (split.direction === 'VERTICAL') {
  //             //     win.rpc.emit('split request vertical');
  //             //   }
  //             //   if (split.direction === 'HORIZONTAL') {
  //             //     win.rpc.emit('split request horizontal');
  //             //   }
  //             // }
  //           // });
  //         });
  //       }, {
  //         position: reccord.position,
  //         size: reccord.size
  //       });
  //     });
  //   } else {
  //     // when no reccords
  //     // when opening create a new window
      createWindow();
  //   }
  // 
  // // start save scheduler
  //   record.save(windowSet);
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
