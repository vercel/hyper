import {UPDATE_INSTALL, UPDATE_AVAILABLE} from '../../typings/constants/updater';
import type {HyperActions} from '../../typings/hyper';
import rpc from '../rpc';

export function installUpdate(): HyperActions {
  return {
    type: UPDATE_INSTALL,
    effect: () => {
      rpc.emit('quit and install');
    }
  };
}

export function updateAvailable(version: string, notes: string, releaseUrl: string, canInstall: boolean): HyperActions {
  return {
    type: UPDATE_AVAILABLE,
    version,
    notes,
    releaseUrl,
    canInstall
  };
}
