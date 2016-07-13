import { ipcRenderer, remote } from 'electron';
const config = remote.require('./config');

export function getConfig () {
  return config.getConfig();
}

export function subscribe (fn) {
  ipcRenderer.on('config change', fn);
  return () => {
    ipcRenderer.removeListener('config change', fn);
  };
}
