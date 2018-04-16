import {UPDATE_INSTALL, UPDATE_AVAILABLE} from '../constants/updater';
import rpc from '../rpc';

export function installUpdate() {
  return {
    type: UPDATE_INSTALL,
    effect: () => {
      rpc.emit('quit and install');
    }
  };
}

export function updateAvailable(version, notes, releaseUrl, canInstall) {
  return {
    type: UPDATE_AVAILABLE,
    version,
    notes,
    releaseUrl,
    canInstall
  };
}
