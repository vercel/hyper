import vm from 'vm';
import notify from '../notify';
import mapKeys from '../utils/map-keys';
import {parsedConfig, rawConfig, configOptions} from '../../lib/config';

const _extract = (script?: vm.Script): Record<string, any> => {
  const module: Record<string, any> = {};
  script?.runInNewContext({module});
  if (!module.exports) {
    throw new Error('Error reading configuration: `module.exports` not set');
  }
  return module.exports;
};

const _syntaxValidation = (cfg: string) => {
  try {
    return new vm.Script(cfg, {filename: '.hyper.js', displayErrors: true});
  } catch (err) {
    notify('Error loading config:', `${err.name}, see DevTools for more info`, {error: err});
  }
};

const _extractDefault = (cfg: string) => {
  return _extract(_syntaxValidation(cfg));
};

// init config
const _init = (cfg: {userCfg: string; defaultCfg: rawConfig}): parsedConfig => {
  const script = _syntaxValidation(cfg.userCfg);
  const _cfg = script && (_extract(script) as rawConfig);
  return {
    config: (() => {
      if (_cfg?.config) {
        return _cfg.config;
      } else {
        notify('Error reading configuration: `config` key is missing');
        return cfg.defaultCfg.config || ({} as configOptions);
      }
    })(),
    // Merging platform specific keymaps with user defined keymaps
    keymaps: mapKeys({...cfg.defaultCfg.keymaps, ..._cfg?.keymaps}),
    // Ignore undefined values in plugin and localPlugins array Issue #1862
    plugins: (_cfg?.plugins && _cfg.plugins.filter(Boolean)) || [],
    localPlugins: (_cfg?.localPlugins && _cfg.localPlugins.filter(Boolean)) || []
  };
};

export {_init, _extractDefault};
