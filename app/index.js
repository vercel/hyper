// Print diagnostic information for a few arguments instead of running Hyper.
if (['--help', '-v', '--version'].includes(process.argv[1])) {
  const {version} = require('./package');
  const configLocation = process.platform === 'win32' ? process.env.userprofile + '\\.hyper.js' : '~/.hyper.js';
  //eslint-disable-next-line no-console
  console.log(`Hyper version ${version}`);
  //eslint-disable-next-line no-console
  console.log('Hyper does not accept any command line arguments. Please modify the config file instead.');
  //eslint-disable-next-line no-console
  console.log(`Hyper configuration file located at: ${configLocation}`);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit();
}

const checkSquirrel = () => {
  let squirrel;

  try {
    squirrel = require('electron-squirrel-startup');
    //eslint-disable-next-line no-empty
  } catch (err) {}

  if (squirrel) {
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit();
  }
};

// handle startup squirrel events
if (process.platform === 'win32') {
  // eslint-disable-next-line import/order
  const systemContextMenu = require('./system-context-menu');

  switch (process.argv[1]) {
    case '--squirrel-install':
    case '--squirrel-updated':
      systemContextMenu.add(() => {
        checkSquirrel();
      });
      break;
    case '--squirrel-uninstall':
      systemContextMenu.remove(() => {
        checkSquirrel();
      });
      break;
    default:
      checkSquirrel();
  }
}

// Native
const {resolve} = require('path');

// Packages
const {app, BrowserWindow, Menu} = require('electron');
const {gitDescribe} = require('git-describe');
const isDev = require('electron-is-dev');

const config = require('./config');

// set up config
config.setup();

const plugins = require('./plugins');
const {addSymlink, addBinToUserPath} = require('./utils/cli-install');

const AppMenu = require('./menus/menu');

const Window = require('./ui/window');

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
  //eslint-disable-next-line no-console
  console.log('running in dev mode');

  // Overide default appVersion which is set from package.json
  gitDescribe({customArguments: ['--tags']}, (error, gitInfo) => {
    if (!error) {
      app.setVersion(gitInfo.raw);
    }
  });
} else {
  //eslint-disable-next-line no-console
  console.log('running in prod mode');
  if (process.platform === 'win32') {
    //eslint-disable-next-line no-console
    addBinToUserPath().catch(err => console.error('Failed to add Hyper CLI path to user PATH', err));
  } else {
    //eslint-disable-next-line no-console
    addSymlink().catch(err => console.error('Failed to symlink Hyper CLI', err));
  }
}

const url = 'file://' + resolve(isDev ? __dirname : app.getAppPath(), 'index.html');
//eslint-disable-next-line no-console
console.log('electron will open', url);

app.on('ready', () =>
  installDevExtensions(isDev)
    .then(() => {
      function createWindow(fn, options = {}) {
        const cfg = plugins.getDecoratedConfig();

        const winSet = config.getWin();
        let [startX, startY] = winSet.position;

        const [width, height] = options.size ? options.size : cfg.windowSize || winSet.size;
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
          const currentScreen = screen.getDisplayNearestPoint({
            x: points[0],
            y: points[1]
          });

          const biggestX = points[0] + 100 + width - currentScreen.bounds.x;
          const biggestY = points[1] + 100 + height - currentScreen.bounds.y;

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

        const hwin = new Window({width, height, x: startX, y: startY}, cfg, fn);
        windowSet.add(hwin);
        hwin.loadURL(url);

        // the window can be closed by the browser process itself
        hwin.on('close', () => {
          hwin.clean();
          windowSet.delete(hwin);
        });

        hwin.on('closed', () => {
          if (process.platform !== 'darwin' && windowSet.size === 0) {
            app.quit();
          }
        });

        return hwin;
      }

      // when opening create a new window
      createWindow();

      // expose to plugins
      app.createWindow = createWindow;

      // check if should be set/removed as default ssh protocol client
      if (config.getConfig().defaultSSHApp && !app.isDefaultProtocolClient('ssh')) {
        //eslint-disable-next-line no-console
        console.log('Setting Hyper as default client for ssh:// protocol');
        app.setAsDefaultProtocolClient('ssh');
      } else if (!config.getConfig().defaultSSHApp && app.isDefaultProtocolClient('ssh')) {
        //eslint-disable-next-line no-console
        console.log('Removing Hyper from default client for ssh:// protocl');
        app.removeAsDefaultProtocolClient('ssh');
      }

      // mac only. when the dock icon is clicked
      // and we don't have any active windows open,
      // we open one
      app.on('activate', () => {
        if (!windowSet.size) {
          createWindow();
        }
      });

      const makeMenu = () => {
        const menu = plugins.decorateMenu(AppMenu.createMenu(createWindow, plugins.getLoadedPluginVersions));

        // If we're on Mac make a Dock Menu
        if (process.platform === 'darwin') {
          const dockMenu = Menu.buildFromTemplate([
            {
              label: 'New Window',
              click() {
                createWindow();
              }
            }
          ]);
          app.dock.setMenu(dockMenu);
        }

        Menu.setApplicationMenu(AppMenu.buildMenu(menu));
      };

      plugins.onApp(app);
      makeMenu();
      plugins.subscribe(plugins.onApp.bind(undefined, app));
      config.subscribe(makeMenu);
    })
    .catch(err => {
      //eslint-disable-next-line no-console
      console.error('Error while loading devtools extensions', err);
    })
);

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

app.on('open-url', (event, sshUrl) => {
  const lastWindow = app.getLastFocusedWindow();
  const callback = win => win.rpc.emit('open ssh', sshUrl);
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

function installDevExtensions(isDev_) {
  if (!isDev_) {
    return Promise.resolve();
  }
  // eslint-disable-next-line import/no-extraneous-dependencies
  const installer = require('electron-devtools-installer');

  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
  const forceDownload = Boolean(process.env.UPGRADE_EXTENSIONS);

  return Promise.all(extensions.map(name => installer.default(installer[name], forceDownload)));
}
