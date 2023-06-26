import type {configOptions} from '../config';

export const CONFIG_LOAD = 'CONFIG_LOAD';
export const CONFIG_RELOAD = 'CONFIG_RELOAD';

export interface ConfigLoadAction {
  type: typeof CONFIG_LOAD;
  config: configOptions;
  now?: number;
}

export interface ConfigReloadAction {
  type: typeof CONFIG_RELOAD;
  config: configOptions;
  now: number;
}

export type ConfigActions = ConfigLoadAction | ConfigReloadAction;
