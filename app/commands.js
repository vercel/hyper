const {app} = require('electron');
const {openConfig} = require('./config');
const {updatePlugins} = require('./plugins');

const commands = {
  'window:new': () => {
    // If window is created on the same tick, it will consume event too
    setTimeout(app.createWindow, 0);
  },
  'tab:new': focusedWindow => {
    focusedWindow.rpc.emit('termgroup add req');
  },
  'pane:splitVertical': focusedWindow => {
    focusedWindow.rpc.emit('split request vertical');
  },
  'pane:splitHorizontal': focusedWindow => {
    focusedWindow.rpc.emit('split request horizontal');
  },
  'pane:close': focusedWindow => {
    focusedWindow.rpc.emit('termgroup close req');
  },
  'window:preferences': () => {
    openConfig();
  },
  'editor:clearBuffer': focusedWindow => {
    focusedWindow.rpc.emit('session clear req');
  },
  'plugins:update': () => {
    updatePlugins();
  },
  'window:reload': focusedWindow => {
    focusedWindow.rpc.emit('reload');
  },
  'window:reloadFull': focusedWindow => {
    focusedWindow.reload();
  },
  'window:devtools': focusedWindow => {
    const webContents = focusedWindow.webContents;
    if (webContents.isDevToolsOpened()) {
      webContents.closeDevTools();
    } else {
      webContents.openDevTools({mode: 'detach'});
    }
  },
  'zoom:reset': focusedWindow => {
    focusedWindow.rpc.emit('reset fontSize req');
  },
  'zoom:in': focusedWindow => {
    focusedWindow.rpc.emit('increase fontSize req');
  },
  'zoom:out': focusedWindow => {
    focusedWindow.rpc.emit('decrease fontSize req');
  },
  'tab:prev': focusedWindow => {
    focusedWindow.rpc.emit('move left req');
  },
  'tab:next': focusedWindow => {
    focusedWindow.rpc.emit('move right req');
  },
  'pane:prev': focusedWindow => {
    focusedWindow.rpc.emit('prev pane req');
  },
  'pane:next': focusedWindow => {
    focusedWindow.rpc.emit('next pane req');
  }
};

//Special numeric command
[1, 2, 3, 4, 5, 6, 7, 8, 'last'].forEach(cmdIndex => {
  const index = cmdIndex === 'last' ? cmdIndex : cmdIndex - 1;
  commands[`tab:jump:${cmdIndex}`] = focusedWindow => {
    focusedWindow.rpc.emit('move jump req', index);
  };
});

exports.execCommand = (command, focusedWindow) => {
  const fn = commands[command];
  if (fn) {
    fn(focusedWindow);
  }
};
