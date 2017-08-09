const {EventEmitter} = require('events');

module.exports = class Invoker extends EventEmitter {
  constructor(win) {
    super();
    this.win = win;

    if (this.destroyed) {
      return;
    }

    this.wc.on('did-finish-load', () => {
      this.wc.send('init', win.uid);
    });
  }

  get wc() {
    return this.win.webContents;
  }

  emit(ch, data) {
    this.wc.send(this.win.uid, {ch, data});
  }

  destroy() {
    this.removeAllListeners();
    this.wc.removeAllListeners();
    // if (this.win.uid) {
    //   ipcMain.removeListener(this.id, this.ipcListener);
    // } else {
    //   // mark for `genUid` in constructor
    //   this.destroyed = true;
    // }
  }

};
