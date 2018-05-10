const {app, BrowserWindow, shell, Menu} = require('electron');
const {isAbsolute} = require('path');
const {parse: parseUrl} = require('url');
const uuid = require('uuid');
const fileUriToPath = require('file-uri-to-path');
const isDev = require('electron-is-dev');
const updater = require('../updater');
const toElectronBackgroundColor = require('../utils/to-electron-background-color');
const {icon, cfgDir} = require('../config/paths');
const createRPC = require('../rpc');
const notify = require('../notify');
const fetchNotifications = require('../notifications');
const Session = require('../session');
const contextMenuTemplate = require('./contextmenu');
const {execCommand} = require('../commands');

module.exports = class Window {
  constructor(options_, cfg, fn) {
    const winOpts = Object.assign(
      {
        minWidth: 370,
        minHeight: 190,
        backgroundColor: toElectronBackgroundColor(cfg.backgroundColor || '#000'),
        titleBarStyle: 'hidden-inset',
        title: 'Hyper.app',
        // we want to go frameless on Windows and Linux
        frame: process.platform === 'darwin',
        transparent: process.platform === 'darwin',
        icon,
        show: process.env.HYPER_DEBUG || process.env.HYPERTERM_DEBUG || isDev,
        acceptFirstMouse: true
      },
      options_
    );
    const window = new BrowserWindow(app.plugins.getDecoratedBrowserOptions(winOpts));
    const rpc = createRPC(window);
    const sessions = new Map();

    const updateBackgroundColor = () => {
      const cfg_ = app.plugins.getDecoratedConfig();
      window.setBackgroundColor(toElectronBackgroundColor(cfg_.backgroundColor || '#000'));
    };

    // config changes
    const cfgUnsubscribe = app.config.subscribe(() => {
      const cfg_ = app.plugins.getDecoratedConfig();

      // notify renderer
      window.webContents.send('config change');

      // notify user that shell changes require new sessions
      if (cfg_.shell !== cfg.shell || JSON.stringify(cfg_.shellArgs) !== JSON.stringify(cfg.shellArgs)) {
        notify('Shell configuration changed!', 'Open a new tab or window to start using the new shell');
      }

      // update background color if necessary
      updateBackgroundColor();

      cfg = cfg_;
    });

    rpc.on('init', () => {
      window.show();
      updateBackgroundColor();

      // If no callback is passed to createWindow,
      // a new session will be created by default.
      if (!fn) {
        fn = win => win.rpc.emit('termgroup add req');
      }

      // app.windowCallback is the createWindow callback
      // that can be set before the 'ready' app event
      // and createWindow deifinition. It's executed in place of
      // the callback passed as parameter, and deleted right after.
      (app.windowCallback || fn)(window);
      delete app.windowCallback;
      fetchNotifications(window);
      // auto updates
      if (!isDev) {
        updater(window);
      } else {
        //eslint-disable-next-line no-console
        console.log('ignoring auto updates during dev');
      }
    });

    rpc.on('new', options => {
      const sessionOpts = Object.assign(
        {
          rows: 40,
          cols: 100,
          cwd: process.argv[1] && isAbsolute(process.argv[1]) ? process.argv[1] : cfgDir,
          splitDirection: undefined,
          shell: cfg.shell,
          shellArgs: cfg.shellArgs && Array.from(cfg.shellArgs)
        },
        options
      );

      const initSession = (opts, fn_) => {
        fn_(uuid.v4(), new Session(opts));
      };

      initSession(sessionOpts, (uid, session) => {
        sessions.set(uid, session);
        rpc.emit('session add', {
          rows: sessionOpts.rows,
          cols: sessionOpts.cols,
          uid,
          splitDirection: sessionOpts.splitDirection,
          shell: session.shell,
          pid: session.pty.pid
        });

        session.on('data', data => {
          rpc.emit('session data', uid + data);
        });

        session.on('exit', () => {
          rpc.emit('session exit', {uid});
          sessions.delete(uid);
        });
      });
    });
    rpc.on('exit', ({uid}) => {
      const session = sessions.get(uid);
      if (session) {
        session.exit();
      }
    });
    rpc.on('unmaximize', () => {
      window.unmaximize();
    });
    rpc.on('maximize', () => {
      window.maximize();
    });
    rpc.on('minimize', () => {
      window.minimize();
    });
    rpc.on('resize', ({uid, cols, rows}) => {
      const session = sessions.get(uid);
      if (session) {
        session.resize({cols, rows});
      }
    });
    rpc.on('data', ({uid, data, escaped}) => {
      const session = sessions.get(uid);
      if (session) {
        if (escaped) {
          const escapedData = session.shell.endsWith('cmd.exe')
            ? `"${data}"` // This is how cmd.exe does it
            : `'${data.replace(/'/g, `'\\''`)}'`; // Inside a single-quoted string nothing is interpreted

          session.write(escapedData);
        } else {
          session.write(data);
        }
      }
    });
    rpc.on('open external', ({url}) => {
      shell.openExternal(url);
    });
    rpc.on('open context menu', selection => {
      const {createWindow} = app;
      const {buildFromTemplate} = Menu;
      buildFromTemplate(contextMenuTemplate(createWindow, selection)).popup(window);
    });
    rpc.on('open hamburger menu', ({x, y}) => {
      Menu.getApplicationMenu().popup(Math.ceil(x), Math.ceil(y));
    });
    // Same deal as above, grabbing the window titlebar when the window
    // is maximized on Windows results in unmaximize, without hitting any
    // app buttons
    for (const ev of ['maximize', 'unmaximize', 'minimize', 'restore']) {
      window.on(ev, () => rpc.emit('windowGeometry change'));
    }
    rpc.win.on('move', () => {
      rpc.emit('move');
    });
    rpc.on('close', () => {
      window.close();
    });
    rpc.on('command', command => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      execCommand(command, focusedWindow);
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

        rpc.emit('session data send', {data: path, escaped: true});
      } else if (protocol === 'http:' || protocol === 'https:') {
        event.preventDefault();
        rpc.emit('session data send', {data: url});
      }
    });

    // xterm makes link clickable
    window.webContents.on('new-window', (event, url) => {
      const protocol = typeof url === 'string' && parseUrl(url).protocol;
      if (protocol === 'http:' || protocol === 'https:') {
        event.preventDefault();
        shell.openExternal(url);
      }
    });

    // expose internals to extension authors
    window.rpc = rpc;
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
        updateBackgroundColor();
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
      rpc.destroy();
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
