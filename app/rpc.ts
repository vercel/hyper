import {EventEmitter} from 'events';
import {ipcMain, BrowserWindow} from 'electron';
import {v4 as uuidv4} from 'uuid';

export class Server extends EventEmitter {
  destroyed = false;
  win: BrowserWindow;
  id!: string;
  constructor(win: BrowserWindow) {
    super();
    this.win = win;
    this.ipcListener = this.ipcListener.bind(this);

    if (this.destroyed) {
      return;
    }

    const uid = uuidv4();
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

  ipcListener(event: any, {ev, data}: {ev: string; data: any}) {
    super.emit(ev, data);
  }

  emit(ch: string, data: any = {}): any {
    // This check is needed because data-batching can cause extra data to be
    // emitted after the window has already closed
    if (!this.win.isDestroyed()) {
      this.wc.send(this.id, {ch, data});
    }
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

export default (win: BrowserWindow) => {
  return new Server(win);
};
