const CONFIG_LOAD = 'CONFIG_LOAD';
const CONFIG_RELOAD = 'CONFIG_RELOAD';

export function load(config) {
  return {
    type: CONFIG_LOAD,
    config
  };
}

export function reload(config) {
  return {
    type: CONFIG_RELOAD,
    config
  };
}
