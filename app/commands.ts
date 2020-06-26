import {app, Menu, BrowserWindow} from 'electron';
import {openConfig, getConfig} from './config';
import {updatePlugins} from './plugins';
import {installCLI} from './utils/cli-install';

const commands: Record<string, (focusedWindow?: BrowserWindow) => void> = {
  'window:new': () => {
    // If window is created on the same tick, it will consume event too
    setTimeout(app.createWindow, 0);
  },
  'tab:new': (focusedWindow) => {
    if (focusedWindow) {
      focusedWindow.rpc.emit('termgroup add req', {});
    } else {
      setTimeout(app.createWindow, 0);
    }
  },
  'pane:splitRight': (focusedWindow) => {
    focusedWindow?.rpc.emit('split request vertical', {});
  },
  'pane:splitDown': (focusedWindow) => {
    focusedWindow?.rpc.emit('split request horizontal', {});
  },
  'pane:close': (focusedWindow) => {
    focusedWindow?.rpc.emit('termgroup close req');
  },
  'window:preferences': () => {
    openConfig();
  },
  'editor:clearBuffer': (focusedWindow) => {
    focusedWindow?.rpc.emit('session clear req');
  },
  'editor:selectAll': (focusedWindow) => {
    focusedWindow?.rpc.emit('term selectAll');
  },
  'plugins:update': () => {
    updatePlugins();
  },
  'window:reload': (focusedWindow) => {
    focusedWindow?.rpc.emit('reload');
  },
  'window:reloadFull': (focusedWindow) => {
    focusedWindow?.reload();
  },
  'window:devtools': (focusedWindow) => {
    if (!focusedWindow) {
      return;
    }
    const webContents = focusedWindow.webContents;
    if (webContents.isDevToolsOpened()) {
      webContents.closeDevTools();
    } else {
      webContents.openDevTools({mode: 'detach'});
    }
  },
  'zoom:reset': (focusedWindow) => {
    focusedWindow?.rpc.emit('reset fontSize req');
  },
  'zoom:in': (focusedWindow) => {
    focusedWindow?.rpc.emit('increase fontSize req');
  },
  'zoom:out': (focusedWindow) => {
    focusedWindow?.rpc.emit('decrease fontSize req');
  },
  'tab:prev': (focusedWindow) => {
    focusedWindow?.rpc.emit('move left req');
  },
  'tab:next': (focusedWindow) => {
    focusedWindow?.rpc.emit('move right req');
  },
  'pane:prev': (focusedWindow) => {
    focusedWindow?.rpc.emit('prev pane req');
  },
  'pane:next': (focusedWindow) => {
    focusedWindow?.rpc.emit('next pane req');
  },
  'editor:movePreviousWord': (focusedWindow) => {
    focusedWindow?.rpc.emit('session move word left req');
  },
  'editor:moveNextWord': (focusedWindow) => {
    focusedWindow?.rpc.emit('session move word right req');
  },
  'editor:moveBeginningLine': (focusedWindow) => {
    focusedWindow?.rpc.emit('session move line beginning req');
  },
  'editor:moveEndLine': (focusedWindow) => {
    focusedWindow?.rpc.emit('session move line end req');
  },
  'editor:deletePreviousWord': (focusedWindow) => {
    focusedWindow?.rpc.emit('session del word left req');
  },
  'editor:deleteNextWord': (focusedWindow) => {
    focusedWindow?.rpc.emit('session del word right req');
  },
  'editor:deleteBeginningLine': (focusedWindow) => {
    focusedWindow?.rpc.emit('session del line beginning req');
  },
  'editor:deleteEndLine': (focusedWindow) => {
    focusedWindow?.rpc.emit('session del line end req');
  },
  'editor:break': (focusedWindow) => {
    focusedWindow?.rpc.emit('session break req');
  },
  'editor:search': (focusedWindow) => {
    focusedWindow?.rpc.emit('session search');
  },
  'editor:search-close': (focusedWindow) => {
    focusedWindow?.rpc.emit('session search close');
  },
  'cli:install': () => {
    installCLI(true);
  },
  'window:hamburgerMenu': () => {
    if (process.platform !== 'darwin' && ['', true].includes(getConfig().showHamburgerMenu)) {
      Menu.getApplicationMenu()!.popup({x: 25, y: 22});
    }
  }
};

//Special numeric command
([1, 2, 3, 4, 5, 6, 7, 8, 'last'] as const).forEach((cmdIndex) => {
  const index = cmdIndex === 'last' ? cmdIndex : cmdIndex - 1;
  commands[`tab:jump:${cmdIndex}`] = (focusedWindow) => {
    focusedWindow?.rpc.emit('move jump req', index);
  };
});

export const execCommand = (command: string, focusedWindow?: BrowserWindow) => {
  const fn = commands[command];
  if (fn) {
    fn(focusedWindow);
  }
};
