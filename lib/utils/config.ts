import {ipcRenderer} from 'electron';
import {require as remoteRequire} from '@electron/remote';
// TODO: Should be updates to new async API https://medium.com/@nornagon/electrons-remote-module-considered-harmful-70d69500f31

const plugins = remoteRequire('./plugins') as typeof import('../../app/plugins');

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
