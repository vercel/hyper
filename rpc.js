const { EventEmitter } = require('events');
const { ipcMain } = require('electron');
const genUid = require('uid2');

class Server {

  constructor (win) {
    this.win = win;
    this.ipcListener = this.ipcListener.bind(this);
    this.emitter = new EventEmitter();
    genUid(10, (err, uid) => {
      if (this.destroyed) return;
      if (err) return this.emitter.emit('error', err);
      this.id = uid;
      ipcMain.on(uid, this.ipcListener);

      // we intentionally subscribe to `on` instead of `once`
      // to support reloading the window and re-initializing
      // the channel
      this.wc.on('did-finish-load', () => {
        this.wc.send('init', uid);
      });
    });
  }

  get wc () {
    return this.win.webContents;
  }

  ipcListener (event, { ev, data }) {
    this.emitter.emit(ev, data);
  }

  emit (ch, data) {
    this.wc.send(this.id, { ch, data });
  }

  on (ev, fn) {
    this.emitter.on(ev, fn);
  }

  once (ev, fn) {
    this.emitter.once(ev, fn);
  }

  removeListener (ev, fn) {
    this.emitter.removeListener(ev, fn);
  }

  removeAllListeners () {
    this.emitter.removeAllListeners();
  }

  destroy () {
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

module.exports = function createRPC (win) {
  return new Server(win);
};
