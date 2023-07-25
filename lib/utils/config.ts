import {require as remoteRequire, getCurrentWindow} from '@electron/remote';
// TODO: Should be updates to new async API https://medium.com/@nornagon/electrons-remote-module-considered-harmful-70d69500f31

import {ipcRenderer} from './ipc';

const plugins = remoteRequire('./plugins') as typeof import('../../app/plugins');

Object.defineProperty(window, 'profileName', {
  get() {
    return getCurrentWindow().profileName;
  },
  set() {
    throw new Error('profileName is readonly');
  }
});

export function getConfig() {
  return plugins.getDecoratedConfig(window.profileName);
}

export function subscribe(fn: (event: Electron.IpcRendererEvent, ...args: any[]) => void) {
  ipcRenderer.on('config change', fn);
  ipcRenderer.on('plugins change', fn);
  return () => {
    ipcRenderer.removeListener('config change', fn);
  };
}
