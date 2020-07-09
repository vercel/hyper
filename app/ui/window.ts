import {app, BrowserWindow, shell, Menu, BrowserWindowConstructorOptions} from 'electron';
import {isAbsolute, normalize, sep} from 'path';
import {parse as parseUrl} from 'url';
import {v4 as uuidv4} from 'uuid';
import fileUriToPath from 'file-uri-to-path';
import isDev from 'electron-is-dev';
import updater from '../updater';
import toElectronBackgroundColor from '../utils/to-electron-background-color';
import {icon, homeDirectory} from '../config/paths';
import createRPC from '../rpc';
import notify from '../notify';
import fetchNotifications from '../notifications';
import Session from '../session';
import contextMenuTemplate from './contextmenu';
import {execCommand} from '../commands';
import {setRendererType, unsetRendererType} from '../utils/renderer-utils';
import {decorateSessionOptions, decorateSessionClass} from '../plugins';

export function newWindow(
  options_: BrowserWindowConstructorOptions,
  cfg: any,
  fn?: (win: BrowserWindow) => void
): BrowserWindow {
  const classOpts = Object.assign({uid: uuidv4()});
  app.plugins.decorateWindowClass(classOpts);

  const winOpts = Object.assign(
    {
      minWidth: 370,
      minHeight: 190,
      backgroundColor: toElectronBackgroundColor(cfg.backgroundColor || '#000'),
      titleBarStyle: 'hiddenInset',
      title: 'Hyper.app',
      // we want to go frameless on Windows and Linux
      frame: process.platform === 'darwin',
      transparent: process.platform === 'darwin',
      icon,
      show: process.env.HYPER_DEBUG || process.env.HYPERTERM_DEBUG || isDev,
      acceptFirstMouse: true,
      webPreferences: {
        nodeIntegration: true,
        navigateOnDragDrop: true
      }
    },
    options_
  );

  const window = new BrowserWindow(app.plugins.getDecoratedBrowserOptions(winOpts));
  window.uid = classOpts.uid;

  app.plugins.onWindowClass(window);
  window.uid = classOpts.uid;

  const rpc = createRPC(window);
  const sessions = new Map();

  const updateBackgroundColor = () => {
    const cfg_ = app.plugins.getDecoratedConfig();
    window.setBackgroundColor(toElectronBackgroundColor(cfg_.backgroundColor || '#000'));
  };

  // set working directory
  let argPath = process.argv[1];
  if (argPath && process.platform === 'win32') {
    if (/[a-zA-Z]:"/.test(argPath)) {
      argPath = argPath.replace('"', sep);
    }
    argPath = normalize(argPath + sep);
  }
  let workingDirectory = homeDirectory;
  if (argPath && isAbsolute(argPath)) {
    workingDirectory = argPath;
  } else if (cfg.workingDirectory && isAbsolute(cfg.workingDirectory)) {
    workingDirectory = cfg.workingDirectory;
  }

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
      fn = (win: BrowserWindow) => win.rpc.emit('termgroup add req', {});
    }

    // app.windowCallback is the createWindow callback
    // that can be set before the 'ready' app event
    // and createWindow definition. It's executed in place of
    // the callback passed as parameter, and deleted right after.
    (app.windowCallback || fn)(window);
    delete app.windowCallback;
    fetchNotifications(window);
    // auto updates
    if (!isDev) {
      updater(window);
    } else {
      console.log('ignoring auto updates during dev');
    }
  });

  function createSession(extraOptions: any = {}) {
    const uid = uuidv4();
    const extraOptionsFiltered: any = {};
    Object.keys(extraOptions).forEach((key) => {
      if (extraOptions[key] !== undefined) extraOptionsFiltered[key] = extraOptions[key];
    });

    // remove the rows and cols, the wrong value of them will break layout when init create
    const defaultOptions = Object.assign(
      {
        cwd: workingDirectory,
        splitDirection: undefined,
        shell: cfg.shell,
        shellArgs: cfg.shellArgs && Array.from(cfg.shellArgs)
      },
      extraOptionsFiltered,
      {uid}
    );
    const options = decorateSessionOptions(defaultOptions);
    const DecoratedSession = decorateSessionClass(Session);
    const session = new DecoratedSession(options);
    sessions.set(uid, session);
    return {session, options};
  }

  rpc.on('new', (extraOptions) => {
    const {session, options} = createSession(extraOptions);

    sessions.set(options.uid, session);
    rpc.emit('session add', {
      rows: options.rows,
      cols: options.cols,
      uid: options.uid,
      splitDirection: options.splitDirection,
      shell: session.shell,
      pid: session.pty ? session.pty.pid : null,
      activeUid: options.activeUid
    });

    session.on('data', (data: string) => {
      rpc.emit('session data', data);
    });

    session.on('exit', () => {
      rpc.emit('session exit', {uid: options.uid});
      unsetRendererType(options.uid);
      sessions.delete(options.uid);
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
  rpc.on('info renderer', ({uid, type}) => {
    // Used in the "About" dialog
    setRendererType(uid, type);
  });
  rpc.on('open external', ({url}) => {
    shell.openExternal(url);
  });
  rpc.on('open context menu', (selection) => {
    const {createWindow} = app;
    const {buildFromTemplate} = Menu;
    buildFromTemplate(contextMenuTemplate(createWindow, selection)).popup({window});
  });
  rpc.on('open hamburger menu', ({x, y}) => {
    Menu.getApplicationMenu()!.popup({x: Math.ceil(x), y: Math.ceil(y)});
  });
  // Same deal as above, grabbing the window titlebar when the window
  // is maximized on Windows results in unmaximize, without hitting any
  // app buttons
  for (const ev of ['maximize', 'unmaximize', 'minimize', 'restore'] as any) {
    window.on(ev, () => rpc.emit('windowGeometry change', {}));
  }
  window.on('move', () => {
    const position = window.getPosition();
    rpc.emit('move', {bounds: {x: position[0], y: position[1]}});
  });
  rpc.on('close', () => {
    window.close();
  });
  rpc.on('command', (command) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    execCommand(command, focusedWindow!);
  });
  // pass on the full screen events from the window to react
  rpc.win.on('enter-full-screen', () => {
    rpc.emit('enter full screen', {});
  });
  rpc.win.on('leave-full-screen', () => {
    rpc.emit('leave full screen', {});
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

  const pluginsUnsubscribe = app.plugins.subscribe((err: any) => {
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
