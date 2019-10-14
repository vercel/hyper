import {ipcRenderer, remote} from 'electron';

const plugins = remote.require('./plugins') as typeof import('../../app/plugins');

export function getConfig() {
  return plugins.getDecoratedConfig();
}

export function subscribe(fn: (event: Electron.IpcRendererEvent, ...args: any[]) => void) {
  ipcRenderer.on('config change', fn);
  ipcRenderer.on('plugins change', fn);
  return () => {
    ipcRenderer.removeListener('config change', fn);
  };
}
