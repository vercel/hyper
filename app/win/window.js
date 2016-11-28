// Native
const {isAbsolute} = require('path');
const {homedir} = require('os');
>>>>>>> Fix pane restoration => root childds

// Packages
const {parse: parseUrl} = require('url');
const {app, BrowserWindow, shell, Menu} = require('electron');
const fileUriToPath = require('file-uri-to-path');
const isDev = require('electron-is-dev');

// Ours
const AutoUpdater = require('../auto-updater');
const toElectronBackgroundColor = require('../utils/to-electron-background-color');
const createRPC = require('../rpc');
const notify = require('../notify');
const fetchNotifications = require('../notifications');
const Tab = require('./tab');

module.exports = class Window extends BrowserWindow {
  constructor(opts, cfg, fn) {
    super(opts);
    this.tabs = new Set([]);

    const rpc = createRPC(this);
    const sessions = new Map();

    // config changes
    const cfgUnsubscribe = app.config.subscribe(() => {
      const cfg_ = app.plugins.getDecoratedConfig();

      // notify renderer
      this.webContents.send('config change');

      // notify user that shell changes require new sessions
      if (cfg_.shell !== cfg.shell ||
        JSON.stringify(cfg_.shellArgs) !== JSON.stringify(cfg.shellArgs)) {
        notify(
          'Shell configuration changed!',
          'Open a new tab or window to start using the new shell'
        );
      }

      cfg = cfg_;
    });

    rpc.on('init', () => {
      this.setBackgroundColor(toElectronBackgroundColor(cfg.backgroundColor || '#000'));
      this.show();

      // If no callback is passed to createWindow,
      // a new session will be created by default.
      if (!fn) {
        fn = () => rpc.emit('termgroup add req');
      }

      // app.windowCallback is the createWindow callback
      // that can be set before the 'ready' app event
      // and createWindow deifinition. It's executed in place of
      // the callback passed as parameter, and deleted right after.
      (app.windowCallback || fn)(this);
      delete (app.windowCallback);

      fetchNotifications(this);
      // auto updates
      if (!isDev && process.platform !== 'linux') {
        AutoUpdater(this);
      } else {
        console.log('ignoring auto updates during dev');
      }
    });

    rpc.on('new tab', ({rows = 40, cols = 100, cwd = process.argv[1] && isAbsolute(process.argv[1]) ? process.argv[1] : homedir(), tab}) => {
      const shell = cfg.shell;
      const shellArgs = cfg.shellArgs && Array.from(cfg.shellArgs);
      this.onTab({rows, cols, cwd, shell, shellArgs}, tab);
    });

    rpc.on('new split', ({rows = 40, cols = 100, cwd = process.argv[1] && isAbsolute(process.argv[1]) ? process.argv[1] : homedir(), splitDirection, activeUid, pane}) => {
      const shell = cfg.shell;
      const shellArgs = cfg.shellArgs && Array.from(cfg.shellArgs);

      const activePane = sessions.get(activeUid);
      activePane.onSplit({rows, cols, cwd, shell, shellArgs, splitDirection, activeUid, parent: activePane}, this, pane);
    });

    rpc.on('exit', ({uid}) => {
      const session = sessions.get(uid).session;
      if (session) {
        session.exit();
      } else {
        console.log('session not found by', uid);
      }
    });

    rpc.on('unmaximize', () => {
      this.unmaximize();
    });

    rpc.on('maximize', () => {
      this.maximize();
    });

    rpc.on('resize', ({uid, cols, rows}) => {
      const session = sessions.get(uid).session;
      session.resize({cols, rows});
    });

    rpc.on('data', ({uid, data}) => {
      const session = sessions.get(uid).session;
      session.write(data);
    });

    rpc.on('open external', ({url}) => {
      shell.openExternal(url);
    });
    
    // Same deal as above, grabbing the window titlebar when the window
    // is maximized on Windows results in unmaximize, without hitting any
    // app buttons
    for (const ev of ['maximize', 'unmaximize', 'minimize', 'restore']) {
      this.on(ev, () => rpc.emit('windowGeometry change'));
    }

    rpc.win.on('move', () => {
      rpc.emit('move');
    });

    rpc.on('open hamburger menu', ({x, y}) => {
      Menu.getApplicationMenu().popup(x, y);
    });

    rpc.on('close', () => {
      this.close();
    });

    const deleteSessions = () => {
      sessions.forEach((element, key) => {
        element.session.removeAllListeners();
        element.session.destroy();
        sessions.delete(key);
      });
    };

    // we reset the rpc channel only upon
    // subsequent refreshes (ie: F5)
    let i = 0;
    this.webContents.on('did-navigate', () => {
      if (i++) {
        deleteSessions();
      }
    });

    // If file is dropped onto the terminal window, navigate event is prevented
    // and his path is added to active session.
    this.webContents.on('will-navigate', (event, url) => {
      const protocol = typeof url === 'string' && parseUrl(url).protocol;
      if (protocol === 'file:') {
        event.preventDefault();
        const path = fileUriToPath(url).replace(/ /g, '\\ ');
        rpc.emit('session data send', {data: path});
      } else if (protocol === 'http:' || protocol === 'https:') {
        event.preventDefault();
        rpc.emit('session data send', {data: url});
      }
    });
    
    // expose internals to extension authors
    this.rpc = rpc;
    this.sessions = sessions;

    const load = () => {
      app.plugins.onWindow(this);
    };

    // load plugins
    load();

    const pluginsUnsubscribe = app.plugins.subscribe(err => {
      if (!err) {
        load();
        this.webContents.send('plugins change');
      }
    });

    // Keep track of focus time of every window, to figure out
    // which one of the existing window is the last focused.
    // Works nicely even if a window is closed and removed.
    const updateFocusTime = () => {
      this.focusTime = process.uptime();
    };

    this.on('focus', () => {
      updateFocusTime();
    });

    // Ensure focusTime is set on window open. The focus event doesn't
    // fire from the dock (see bug #583)
    updateFocusTime();

    // the window can be closed by the browser process itself
    this.on('close', () => {
      app.config.window.recordState(this);
      rpc.destroy();
      deleteSessions();
      cfgUnsubscribe();
      pluginsUnsubscribe();
    });
  }

  onTab(opts, recorded) {
    let id;
    if (recorded) {
      id = recorded.id;
    }
    this.tabs.add(new Tab(id, this, tab => {
      tab.onRoot(opts, recorded);
    }));
  }

  onDeleteTab(tab) {
    this.tabs.delete(tab);
  }

  restore(tabs) {
    tabs.forEach(tab => {
      this.rpc.emit('tab restore', {tab});
    });
  }

  record(fn) {
    const win = {id: this.id, size: this.getSize(), position: this.getPosition(), tabs: []};
    this.tabs.forEach(tab => {
      tab.record(state => {
        win.tabs.push(state);
      });
    });
    fn(win);
  }

};
