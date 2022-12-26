import {copySync, existsSync, writeFileSync, readFileSync, copy} from 'fs-extra';
import {sync as mkdirpSync} from 'mkdirp';
import {
  defaultCfg,
  cfgPath,
  legacyCfgPath,
  plugs,
  defaultPlatformKeyPath,
  schemaPath,
  cfgDir,
  schemaFile
} from './paths';
import {_init, _extractDefault} from './init';
import notify from '../notify';
import {rawConfig} from '../../lib/config';
import _ from 'lodash';
import {resolve} from 'path';

let defaultConfig: rawConfig;

const _write = (path: string, data: string) => {
  // This method will take text formatted as Unix line endings and transform it
  // to text formatted with DOS line endings. We do this because the default
  // text editor on Windows (notepad) doesn't Deal with LF files. Still. In 2017.
  const crlfify = (str: string) => {
    return str.replace(/\r?\n/g, '\r\n');
  };
  const format = process.platform === 'win32' ? crlfify(data.toString()) : data;
  writeFileSync(path, format, 'utf8');
};

// Migrate Hyper3 config to Hyper4 but only if the user hasn't manually
// touched the new config and if the old config is not a symlink
const migrateHyper3Config = () => {
  copy(schemaPath, resolve(cfgDir, schemaFile), (err) => {
    if (err) {
      console.error(err);
    }
  });

  if (existsSync(cfgPath)) {
    return;
  }

  if (!existsSync(legacyCfgPath)) {
    copySync(defaultCfg, cfgPath);
    return;
  }

  // Migrate
  const defaultCfgData = JSON.parse(readFileSync(defaultCfg, 'utf8'));
  const legacyCfgData = _extractDefault(readFileSync(legacyCfgPath, 'utf8'));
  const newCfgData = _.merge(defaultCfgData, legacyCfgData);
  _write(cfgPath, JSON.stringify(newCfgData, null, 2));

  notify(
    'Hyper 4',
    `Settings location and format has changed.\nWe've automatically migrated your existing config to ${cfgPath}`
  );
};

const _importConf = () => {
  // init plugin directories if not present
  mkdirpSync(plugs.base);
  mkdirpSync(plugs.local);

  try {
    migrateHyper3Config();
  } catch (err) {
    console.error(err);
  }

  let defaultCfgRaw = '{}';
  try {
    defaultCfgRaw = readFileSync(defaultCfg, 'utf8');
  } catch (err) {
    console.log(err);
  }
  const _defaultCfg = JSON.parse(defaultCfgRaw) as rawConfig;

  // Importing platform specific keymap
  let content = '{}';
  try {
    content = readFileSync(defaultPlatformKeyPath(), 'utf8');
  } catch (err) {
    console.error(err);
  }
  const mapping = JSON.parse(content) as Record<string, string | string[]>;
  _defaultCfg.keymaps = mapping;

  // Import user config
  let userCfg: rawConfig;
  try {
    userCfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
  } catch (err) {
    _write(cfgPath, defaultCfgRaw);
    userCfg = JSON.parse(defaultCfgRaw);
  }

  return {userCfg, defaultCfg: _defaultCfg};
};

export const _import = () => {
  const imported = _importConf();
  defaultConfig = imported.defaultCfg;
  const result = _init(imported.userCfg, imported.defaultCfg);
  return result;
};

export const getDefaultConfig = () => {
  if (!defaultConfig) {
    defaultConfig = _importConf().defaultCfg;
  }
  return defaultConfig;
};
