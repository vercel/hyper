import {EventEmitter} from 'events';

import type {IpcRendererEvent} from 'electron';

import type {
  FilterNever,
  IpcRendererWithCommands,
  MainEvents,
  RendererEvents,
  TypedEmitter
} from '../../typings/common';

import {ipcRenderer} from './ipc';

export default class Client {
  emitter: TypedEmitter<RendererEvents>;
  ipc: IpcRendererWithCommands;
  id!: string;

  constructor() {
    this.emitter = new EventEmitter();
    this.ipc = ipcRenderer;
    this.emit = this.emit.bind(this);
    if (window.__rpcId) {
      setTimeout(() => {
        this.id = window.__rpcId;
        this.ipc.on(this.id, this.ipcListener);
        this.emitter.emit('ready');
      }, 0);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.ipc.on('init', (ev: IpcRendererEvent, uid: string, profileName: string) => {
        // we cache so that if the object
        // gets re-instantiated we don't
        // wait for a `init` event
        window.__rpcId = uid;
        // window.profileName = profileName;
        this.id = uid;
        this.ipc.on(uid, this.ipcListener);
        this.emitter.emit('ready');
      });
    }
  }

  ipcListener = <U extends keyof RendererEvents>(
    event: IpcRendererEvent,
    {ch, data}: {ch: U; data: RendererEvents[U]}
  ) => this.emitter.emit(ch, data);

  on = <U extends keyof RendererEvents>(ev: U, fn: (arg0: RendererEvents[U]) => void) => {
    this.emitter.on(ev, fn);
    return this;
  };

  once = <U extends keyof RendererEvents>(ev: U, fn: (arg0: RendererEvents[U]) => void) => {
    this.emitter.once(ev, fn);
    return this;
  };

  emit<U extends Exclude<keyof MainEvents, FilterNever<MainEvents>>>(ev: U): boolean;
  emit<U extends FilterNever<MainEvents>>(ev: U, data: MainEvents[U]): boolean;
  emit<U extends keyof MainEvents>(ev: U, data?: MainEvents[U]) {
    if (!this.id) {
      throw new Error('Not ready');
    }
    this.ipc.send(this.id, {ev, data});
    return true;
  }

  removeListener = <U extends keyof RendererEvents>(ev: U, fn: (arg0: RendererEvents[U]) => void) => {
    this.emitter.removeListener(ev, fn);
    return this;
  };

  removeAllListeners = () => {
    this.emitter.removeAllListeners();
    return this;
  };

  destroy = () => {
    this.removeAllListeners();
    this.ipc.removeAllListeners(this.id);
  };
}
