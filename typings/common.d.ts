import type {ExecFileOptions, ExecOptions} from 'child_process';

import type {IpcMain, IpcRenderer} from 'electron';

import type parseUrl from 'parse-url';

import type {configOptions} from './config';

export type Session = {
  uid: string;
  rows?: number | null;
  cols?: number | null;
  splitDirection?: 'HORIZONTAL' | 'VERTICAL';
  shell: string | null;
  pid: number | null;
  activeUid?: string;
  profile: string;
};

export type sessionExtraOptions = {
  cwd?: string;
  splitDirection?: 'HORIZONTAL' | 'VERTICAL';
  activeUid?: string | null;
  isNewGroup?: boolean;
  rows?: number;
  cols?: number;
  shell?: string;
  shellArgs?: string[];
  profile?: string;
};

export type MainEvents = {
  close: never;
  command: string;
  data: {uid: string | null; data: string; escaped?: boolean};
  exit: {uid: string};
  'info renderer': {uid: string; type: string};
  init: null;
  maximize: never;
  minimize: never;
  new: sessionExtraOptions;
  'open context menu': string;
  'open external': {url: string};
  'open hamburger menu': {x: number; y: number};
  'quit and install': never;
  resize: {uid: string; cols: number; rows: number};
  unmaximize: never;
};

export type RendererEvents = {
  ready: never;
  'add notification': {text: string; url: string; dismissable: boolean};
  'update available': {releaseNotes: string; releaseName: string; releaseUrl: string; canInstall: boolean};
  'open ssh': ReturnType<typeof parseUrl>;
  'open file': {path: string};
  'move jump req': number | 'last';
  'reset fontSize req': never;
  'move left req': never;
  'move right req': never;
  'prev pane req': never;
  'decrease fontSize req': never;
  'increase fontSize req': never;
  'next pane req': never;
  'session break req': never;
  'session quit req': never;
  'session search close': never;
  'session search': never;
  'session stop req': never;
  'session tmux req': never;
  'session del line beginning req': never;
  'session del line end req': never;
  'session del word left req': never;
  'session del word right req': never;
  'session move line beginning req': never;
  'session move line end req': never;
  'session move word left req': never;
  'session move word right req': never;
  'term selectAll': never;
  reload: never;
  'session clear req': never;
  'split request horizontal': {activeUid?: string; profile?: string};
  'split request vertical': {activeUid?: string; profile?: string};
  'termgroup add req': {activeUid?: string; profile?: string};
  'termgroup close req': never;
  'session add': Session;
  'session data': string;
  'session exit': {uid: string};
  'windowGeometry change': {isMaximized: boolean};
  move: {bounds: {x: number; y: number}};
  'enter full screen': never;
  'leave full screen': never;
  'session data send': {uid: string | null; data: string; escaped?: boolean};
};

/**
 * Get keys of T where the value is not never
 */
export type FilterNever<T> = {[K in keyof T]: T[K] extends never ? never : K}[keyof T];

export interface TypedEmitter<Events> {
  on<E extends keyof Events>(event: E, listener: (args: Events[E]) => void): this;
  once<E extends keyof Events>(event: E, listener: (args: Events[E]) => void): this;
  emit<E extends Exclude<keyof Events, FilterNever<Events>>>(event: E): boolean;
  emit<E extends FilterNever<Events>>(event: E, data: Events[E]): boolean;
  emit<E extends keyof Events>(event: E, data?: Events[E]): boolean;
  removeListener<E extends keyof Events>(event: E, listener: (args: Events[E]) => void): this;
  removeAllListeners<E extends keyof Events>(event?: E): this;
}

type OptionalPromise<T> = T | Promise<T>;

export type IpcCommands = {
  'child_process.exec': (command: string, options: ExecOptions) => {stdout: string; stderr: string};
  'child_process.execFile': (
    file: string,
    args: string[],
    options: ExecFileOptions
  ) => {
    stdout: string;
    stderr: string;
  };
  getLoadedPluginVersions: () => {name: string; version: string}[];
  getPaths: () => {plugins: string[]; localPlugins: string[]};
  getBasePaths: () => {path: string; localPath: string};
  getDeprecatedConfig: () => Record<string, {css: string[]}>;
  getDecoratedConfig: (profile: string) => configOptions;
  getDecoratedKeymaps: () => Record<string, string[]>;
};

export interface IpcMainWithCommands extends IpcMain {
  handle<E extends keyof IpcCommands>(
    channel: E,
    listener: (
      event: Electron.IpcMainInvokeEvent,
      ...args: Parameters<IpcCommands[E]>
    ) => OptionalPromise<ReturnType<IpcCommands[E]>>
  ): void;
}

export interface IpcRendererWithCommands extends IpcRenderer {
  invoke<E extends keyof IpcCommands>(
    channel: E,
    ...args: Parameters<IpcCommands[E]>
  ): Promise<ReturnType<IpcCommands[E]>>;
}
