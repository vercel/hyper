const {app, BrowserWindow, shell, Menu} = require('electron');
const {parse: parseUrl} = require('url');
const uuid = require('uuid');
const fileUriToPath = require('file-uri-to-path');
const isDev = require('electron-is-dev');
const {icon} = require('../config/paths');
const notify = require('../notify');
const toElectronBackgroundColor = require('./utils/to-electron-background-color');
const Invoker = require('./com/invoker');
const {parser} = require('./com/parser');

module.exports = class Window {
  constructor(options, cfg, fn) {
    const opts = Object.assign({
      minWidth: 370,
      minHeight: 190,
      backgroundColor: toElectronBackgroundColor(cfg.backgroundColor || '#000'),
      titleBarStyle: 'hidden-inset',
      title: 'Hyper.app',
      // we want to go frameless on windows and linux
      frame: process.platform === 'darwin',
      transparent: process.platform === 'darwin',
      icon,
      show: process.env.HYPER_DEBUG || process.env.HYPERTERM_DEBUG || isDev,
      acceptFirstMouse: true
    }, options);
    const window = new BrowserWindow(app.plugins.getDecoratedBrowserOptions(opts));
    window.uid = uuid.v4();
    const sessions = new Map();
    const invoker = new Invoker(window);
    parser(window, cfg, fn);

    // config changes
    const cfgUnsubscribe = app.config.subscribe(() => {
      const cfg_ = app.plugins.getDecoratedConfig();

      // notify renderer
      window.webContents.send('config change');

      // notify user that shell changes require new sessions
      if (cfg_.shell !== cfg.shell ||
        JSON.stringify(cfg_.shellArgs) !== JSON.stringify(cfg.shellArgs)) {
        notify(
          'Shell configuration changed!',
          'Open a new tab or window to start using the new shell'
        );
      }

      // update background color if necessary
      cfg = cfg_;
    });
    invoker.on('open external', ({url}) => {
      shell.openExternal(url);
    });
    invoker.on('open hamburger menu', ({x, y}) => {
      Menu.getApplicationMenu().popup(Math.ceil(x), Math.ceil(y));
    });
    // Same deal as above, grabbing the window titlebar when the window
    // is maximized on Windows results in unmaximize, without hitting any
    // app buttons
    for (const ev of ['maximize', 'unmaximize', 'minimize', 'restore']) {
      window.on(ev, () => {
        invoker.emit('windowGeometry change');
      });
    }
    window.on('move', () => {
      invoker.emit('move');
    });
    invoker.on('close', () => {
      window.close();
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
    window.webContents.on('did-navigate', () => {
      if (i++) {
        deleteSessions();
      }
    });

    // If file is dropped onto the terminal window, navigate event is prevented
    // and his path is added to active session.
    window.webContents.on('will-navigate', (event, url) => {
      const protocol = typeof url === 'string' && parseUrl(url).protocol;
      if (protocol === 'file:') {
        event.preventDefault();

        const path = fileUriToPath(url);

        invoker.emit('session data send', {data: path, escaped: true});
      } else if (protocol === 'http:' || protocol === 'https:') {
        event.preventDefault();
        invoker.emit('session data send', {data: url});
      }
    });

    // expose internals to extension authors
    // keep rpc for backward compatibility
    window.rpc = invoker;
    window.sessions = sessions;

    const load = () => {
      app.plugins.onWindow(window);
    };

    // load plugins
    load();

    const pluginsUnsubscribe = app.plugins.subscribe(err => {
      if (!err) {
        load();
        window.webContents.send('plugins change');
      }
    });

    // Keep track of focus time of every window, to figure out
    // which one of the existing window is the last focused.
    // Works nicely even if a window is closed and removed.
    const updateFocusTime = () => {
      window.focusTime = process.uptime();
    };

    window.on('focus', () => {
      updateFocusTime();
    });

    // the window can be closed by the browser process itself
    window.clean = () => {
      app.config.winRecord(window);
      invoker.destroy();
      deleteSessions();
      cfgUnsubscribe();
      pluginsUnsubscribe();
    };
    // Ensure focusTime is set on window open. The focus event doesn't
    // fire from the dock (see bug #583)
    updateFocusTime();

    return window;
  }
};
