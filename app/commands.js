const {app} = require('electron');
const {openConfig} = require('./config');
const {updatePlugins} = require('./plugins');

const commands = {
  'window:new': () => {
    // If window is created on the same tick, it will consume event too
    setTimeout(app.createWindow, 0);
  },
  'tab:new': focusedWindow => {
    if (focusedWindow) {
      focusedWindow.rpc.emit('termgroup add req');
    } else {
      setTimeout(app.createWindow, 0);
    }
  },
  'pane:splitVertical': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('split request vertical');
  },
  'pane:splitHorizontal': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('split request horizontal');
  },
  'pane:close': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('termgroup close req');
  },
  'window:preferences': () => {
    openConfig();
  },
  'editor:clearBuffer': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('session clear req');
  },
  'plugins:update': () => {
    updatePlugins();
  },
  'window:reload': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('reload');
  },
  'window:reloadFull': focusedWindow => {
    focusedWindow && focusedWindow.reload();
  },
  'window:devtools': focusedWindow => {
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
  'zoom:reset': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('reset fontSize req');
  },
  'zoom:in': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('increase fontSize req');
  },
  'zoom:out': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('decrease fontSize req');
  },
  'tab:prev': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('move left req');
  },
  'tab:next': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('move right req');
  },
  'pane:prev': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('prev pane req');
  },
  'pane:next': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('next pane req');
  },
  'editor:movePreviousWord': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('session move word left req');
  },
  'editor:moveNextWord': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('session move word right req');
  },
  'editor:moveBeginningLine': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('session move line beginning req');
  },
  'editor:moveEndLine': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('session move line end req');
  },
  'editor:deletePreviousWord': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('session del word left req');
  },
  'editor:deleteNextWord': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('session del word right req');
  },
  'editor:deleteBeginningLine': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('session del line beginning req');
  },
  'editor:deleteEndLine': focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('session del line end req');
  }
};

//Special numeric command
[1, 2, 3, 4, 5, 6, 7, 8, 'last'].forEach(cmdIndex => {
  const index = cmdIndex === 'last' ? cmdIndex : cmdIndex - 1;
  commands[`tab:jump:${cmdIndex}`] = focusedWindow => {
    focusedWindow && focusedWindow.rpc.emit('move jump req', index);
  };
});

exports.execCommand = (command, focusedWindow) => {
  const fn = commands[command];
  if (fn) {
    fn(focusedWindow);
  }
};
