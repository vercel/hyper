// Print diagnostic information for a few arguments instead of running Hyper.
if (['--help', '-v', '--version'].includes(process.argv[1])) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {version} = require('./package');
  const configLocation = process.platform === 'win32' ? `${process.env.userprofile}\\.hyper.js` : '~/.hyper.js';
  console.log(`Hyper version ${version}`);
  console.log('Hyper does not accept any command line arguments. Please modify the config file instead.');
  console.log(`Hyper configuration file located at: ${configLocation}`);
  process.exit();
}

// Native
import {resolve} from 'path';

// Packages
import {app, BrowserWindow, Menu} from 'electron';
import {gitDescribe} from 'git-describe';
import isDev from 'electron-is-dev';
import * as config from './config';

// set up config
config.setup();

import * as plugins from './plugins';
import {installCLI} from './utils/cli-install';
import * as AppMenu from './menus/menu';
import {newWindow} from './ui/window';
import * as windowUtils from './utils/window-utils';

const windowSet = new Set<BrowserWindow>([]);

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

console.log('Disabling Chromium GPU blacklist');
app.commandLine.appendSwitch('ignore-gpu-blacklist');

if (isDev) {
  console.log('running in dev mode');

  // Override default appVersion which is set from package.json
  gitDescribe({customArguments: ['--tags']}, (error: any, gitInfo: any) => {
    if (!error) {
      app.setVersion(gitInfo.raw);
    }
  });
} else {
  console.log('running in prod mode');
}

const url = `file://${resolve(isDev ? __dirname : app.getAppPath(), 'index.html')}`;
console.log('electron will open', url);

async function installDevExtensions(isDev_: boolean) {
  if (!isDev_) {
    return [];
  }
  const installer = await import('electron-devtools-installer');

  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'] as const;
  const forceDownload = Boolean(process.env.UPGRADE_EXTENSIONS);

  return Promise.all(
    extensions.map((name) =>
      installer.default(installer[name], {forceDownload, loadExtensionOptions: {allowFileAccess: true}})
    )
  );
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.on('ready', () =>
  installDevExtensions(isDev)
    .then(() => {
      function createWindow(
        fn?: (win: BrowserWindow) => void,
        options: {size?: [number, number]; position?: [number, number]} = {}
      ) {
        const cfg = plugins.getDecoratedConfig();

        const winSet = config.getWin();
        let [startX, startY] = winSet.position;

        const [width, height] = options.size ? options.size : cfg.windowSize || winSet.size;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

        if (!windowUtils.positionIsValid([startX, startY])) {
          [startX, startY] = config.windowDefaults.windowPosition;
        }

        const hwin = newWindow({width, height, x: startX, y: startY}, cfg, fn);
        windowSet.add(hwin);
        void hwin.loadURL(url);

        // the window can be closed by the browser process itself
        hwin.on('close', () => {
          hwin.clean();
          windowSet.delete(hwin);
        });

        return hwin;
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

      app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          app.quit();
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
      if (!isDev) {
        // check if should be set/removed as default ssh protocol client
        if (config.getConfig().defaultSSHApp && !app.isDefaultProtocolClient('ssh')) {
          console.log('Setting Hyper as default client for ssh:// protocol');
          app.setAsDefaultProtocolClient('ssh');
        } else if (!config.getConfig().defaultSSHApp && app.isDefaultProtocolClient('ssh')) {
          console.log('Removing Hyper from default client for ssh:// protocol');
          app.removeAsDefaultProtocolClient('ssh');
        }
        void installCLI(false);
      }
    })
    .catch((err) => {
      console.error('Error while loading devtools extensions', err);
    })
);

/**
 * Get last focused BrowserWindow or create new if none and callback
 * @param callback Function to call with the BrowserWindow
 */
function GetWindow(callback: (win: BrowserWindow) => void) {
  const lastWindow = app.getLastFocusedWindow();
  if (lastWindow) {
    callback(lastWindow);
  } else if (!lastWindow && {}.hasOwnProperty.call(app, 'createWindow')) {
    app.createWindow(callback);
  } else {
    // If createWindow doesn't exist yet ('ready' event was not fired),
    // sets his callback to an app.windowCallback property.
    app.windowCallback = callback;
  }
}

app.on('open-file', (_event, path) => {
  GetWindow((win: BrowserWindow) => {
    win.rpc.emit('open file', {path});
  });
});

app.on('open-url', (_event, sshUrl) => {
  GetWindow((win: BrowserWindow) => {
    win.rpc.emit('open ssh', sshUrl);
  });
});
