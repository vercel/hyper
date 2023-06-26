import {CONFIG_LOAD, CONFIG_RELOAD} from '../constants/config';
import type {HyperActions} from '../hyper';
import type {configOptions} from '../config';

export function loadConfig(config: configOptions): HyperActions {
  return {
    type: CONFIG_LOAD,
    config
  };
}

export function reloadConfig(config: configOptions): HyperActions {
  const now = Date.now();
  return {
    type: CONFIG_RELOAD,
    config,
    now
  };
}
