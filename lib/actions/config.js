import {CONFIG_LOAD, CONFIG_RELOAD} from '../constants/config';

export function loadConfig(config) {
  return {
    type: CONFIG_LOAD,
    config
  };
}

export function reloadConfig(config) {
  const now = Date.now();
  return {
    type: CONFIG_RELOAD,
    config,
    now
  };
}
