import {EventEmitter} from 'events';
import {IpcRenderer, IpcRendererEvent} from 'electron';
import electron from 'electron';
export default class Client {
  emitter: EventEmitter;
  ipc: IpcRenderer;
  id!: string;
  constructor() {
    this.emitter = new EventEmitter();
    this.ipc = electron.ipcRenderer;
    if (window.__rpcId) {
      setTimeout(() => {
        this.id = window.__rpcId;
        this.ipc.on(this.id, this.ipcListener);
        this.emitter.emit('ready');
      }, 0);
    } else {
      this.ipc.on('init', (ev: IpcRendererEvent, uid: string) => {
        // we cache so that if the object
        // gets re-instantiated we don't
        // wait for a `init` event
        window.__rpcId = uid;
        this.id = uid;
        this.ipc.on(uid, this.ipcListener);
        this.emitter.emit('ready');
      });
    }
  }

  ipcListener = (event: any, {ch, data}: {ch: string; data: any}) => {
    this.emitter.emit(ch, data);
  };

  on(ev: string, fn: (...args: any[]) => void) {
    this.emitter.on(ev, fn);
  }

  once(ev: string, fn: (...args: any[]) => void) {
    this.emitter.once(ev, fn);
  }

  emit(ev: string, data: any) {
    if (!this.id) {
      throw new Error('Not ready');
    }
    this.ipc.send(this.id, {ev, data});
  }

  removeListener(ev: string, fn: (...args: any[]) => void) {
    this.emitter.removeListener(ev, fn);
  }

  removeAllListeners() {
    this.emitter.removeAllListeners();
  }

  destroy() {
    this.removeAllListeners();
    this.ipc.removeAllListeners(this.id);
  }
}
