import {EventEmitter} from 'events';
import {ipcMain, BrowserWindow} from 'electron';
import {v4 as uuidv4} from 'uuid';
import {TypedEmitter, MainEvents, RendererEvents, FilterNever} from '../common';

export class Server {
  emitter: TypedEmitter<MainEvents>;
  destroyed = false;
  win: BrowserWindow;
  id!: string;

  constructor(win: BrowserWindow) {
    this.emitter = new EventEmitter();
    this.win = win;
    this.emit = this.emit.bind(this);

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

  ipcListener = (event: any, {ev, data}: {ev: keyof MainEvents; data: any}) => this.emitter.emit(ev, data);

  on = <U extends keyof MainEvents>(ev: U, fn: (arg0: MainEvents[U]) => void) => {
    this.emitter.on(ev, fn);
    return this;
  };

  once = <U extends keyof MainEvents>(ev: U, fn: (arg0: MainEvents[U]) => void) => {
    this.emitter.once(ev, fn);
    return this;
  };

  emit<U extends Exclude<keyof RendererEvents, FilterNever<RendererEvents>>>(ch: U): boolean;
  emit<U extends FilterNever<RendererEvents>>(ch: U, data: RendererEvents[U]): boolean;
  emit<U extends keyof RendererEvents>(ch: U, data?: RendererEvents[U]) {
    // This check is needed because data-batching can cause extra data to be
    // emitted after the window has already closed
    if (!this.win.isDestroyed()) {
      this.wc.send(this.id, {ch, data});
      return true;
    }
    return false;
  }

  destroy() {
    this.emitter.removeAllListeners();
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
