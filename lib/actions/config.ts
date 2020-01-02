import {CONFIG_LOAD, CONFIG_RELOAD} from '../constants/config';
import {HyperActions} from '../hyper';

export function loadConfig(config: any): HyperActions {
  return {
    type: CONFIG_LOAD,
    config
  };
}

export function reloadConfig(config: any): HyperActions {
  const now = Date.now();
  return {
    type: CONFIG_RELOAD,
    config,
    now
  };
}
