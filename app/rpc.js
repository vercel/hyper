const {EventEmitter} = require('events');
const {ipcMain} = require('electron');
const uuid = require('uuid');

class Server extends EventEmitter {

  constructor(win) {
    super();
    this.win = win;
    this.ipcListener = this.ipcListener.bind(this);

    if (this.destroyed) {
      return;
    }

    const uid = uuid.v4();
    this.id = uid;

    ipcMain.on(uid, this.ipcListener);

    // we intentionally subscribe to `on` instead of `once`
    // to support reloading the window and re-initializing
    // the channel
    this.wc.on('did-finish-load', () => {
      this.wc.send('init', uid);
    });
  }

  get wc() {
    return this.win.webContents;
  }

  ipcListener(event, {ev, data}) {
    super.emit(ev, data);
  }

  emit(ch, data) {
    this.wc.send(this.id, {ch, data});
  }

  destroy() {
    this.removeAllListeners();
    this.wc.removeAllListeners();
    if (this.id) {
      ipcMain.removeListener(this.id, this.ipcListener);
    } else {
      // mark for `genUid` in constructor
      this.destroyed = true;
    }
  }

}

module.exports = win => {
  return new Server(win);
};
