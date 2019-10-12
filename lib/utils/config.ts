import {ipcRenderer, remote} from 'electron';

const plugins = remote.require('./plugins');

export function getConfig() {
  return plugins.getDecoratedConfig();
}

export function subscribe(fn) {
  ipcRenderer.on('config change', fn);
  ipcRenderer.on('plugins change', fn);
  return () => {
    ipcRenderer.removeListener('config change', fn);
  };
}
