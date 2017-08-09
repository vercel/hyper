const {ipcMain} = require('electron');
const init = require('../actions/init');
const resize = require('../actions/resize');
const newSession = require('../actions/new');
const buffer = require('../actions/buffer');
const exit = require('../actions/exit');

const parser = (win, cfg, fn) => {
  ipcMain.on(win.uid, (event, arg) => {
    console.log(win.uid);
    console.log(arg);  // prints "ping"
    const {ev, data} = arg;
    switch (ev) {
      case 'init':
        init(win, cfg, fn);
        break;
      case 'maximize':
        win.maximize();
        break;
      case 'minimize':
        win.minimize();
        break;
      case 'unmaximize':
        win.unmaximize();
        break;
      case 'resize':
        resize(win, data);
        break;
      case 'new':
        newSession(win, data, cfg);
        break;
      case 'data':
        buffer(win, data, cfg);
        break;
      case 'exit':
        exit(win, data);
        break;
      default:
    }
  });
};

module.exports = {
  parser
};
