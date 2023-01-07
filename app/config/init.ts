import vm from 'vm';
import notify from '../notify';
import mapKeys from '../utils/map-keys';
import {parsedConfig, rawConfig, configOptions} from '../../lib/config';
import _ from 'lodash';

const _extract = (script?: vm.Script): Record<string, any> => {
  const module: Record<string, any> = {};
  script?.runInNewContext({module});
  if (!module.exports) {
    throw new Error('Error reading configuration: `module.exports` not set');
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return module.exports;
};

const _syntaxValidation = (cfg: string) => {
  try {
    return new vm.Script(cfg, {filename: '.hyper.js', displayErrors: true});
  } catch (_err) {
    const err = _err as {name: string};
    notify(`Error loading config: ${err.name}`, `${err}`, {error: err});
  }
};

const _extractDefault = (cfg: string) => {
  return _extract(_syntaxValidation(cfg));
};

// init config
const _init = (userCfg: rawConfig, defaultCfg: rawConfig): parsedConfig => {
  return {
    config: (() => {
      if (userCfg?.config) {
        return _.merge({}, defaultCfg.config, userCfg.config);
      } else {
        notify('Error reading configuration: `config` key is missing');
        return defaultCfg.config || ({} as configOptions);
      }
    })(),
    // Merging platform specific keymaps with user defined keymaps
    keymaps: mapKeys({...defaultCfg.keymaps, ...userCfg?.keymaps}),
    // Ignore undefined values in plugin and localPlugins array Issue #1862
    plugins: (userCfg?.plugins && userCfg.plugins.filter(Boolean)) || [],
    localPlugins: (userCfg?.localPlugins && userCfg.localPlugins.filter(Boolean)) || []
  };
};

export {_init, _extractDefault};
