import {moveSync, copySync, existsSync, writeFileSync, readFileSync, lstatSync} from 'fs-extra';
import {sync as mkdirpSync} from 'mkdirp';
import {defaultCfg, cfgPath, legacyCfgPath, plugs, defaultPlatformKeyPath} from './paths';
import {_init, _extractDefault} from './init';
import notify from '../notify';
import {rawConfig} from '../../lib/config';

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

// Saves a file as backup by appending '.backup' or '.backup2', '.backup3', etc.
// so as to not override any existing files
const saveAsBackup = (src: string) => {
  let attempt = 1;
  while (attempt < 100) {
    const backupPath = `${src}.backup${attempt === 1 ? '' : attempt}`;
    if (!existsSync(backupPath)) {
      moveSync(src, backupPath);
      return backupPath;
    }
    attempt++;
  }
  throw new Error('Failed to create backup for config file. Too many backups');
};

// Migrate Hyper2 config to Hyper3 but only if the user hasn't manually
// touched the new config and if the old config is not a symlink
const migrateHyper2Config = () => {
  if (cfgPath === legacyCfgPath) {
    // No need to migrate
    return;
  }
  if (!existsSync(legacyCfgPath)) {
    // Already migrated or user never used Hyper 2
    return;
  }
  const existsNew = existsSync(cfgPath);
  if (lstatSync(legacyCfgPath).isSymbolicLink() || (existsNew && lstatSync(cfgPath).isSymbolicLink())) {
    // One of the files is a symlink, there could be a number of complications
    // in this case so let's avoid those and not do automatic migration
    return;
  }

  if (existsNew) {
    const cfg1 = readFileSync(defaultCfg, 'utf8').replace(/\r|\n/g, '');
    const cfg2 = readFileSync(cfgPath, 'utf8').replace(/\r|\n/g, '');
    const hasNewConfigBeenTouched = cfg1 !== cfg2;
    if (hasNewConfigBeenTouched) {
      // Assume the user has migrated manually but rename old config to .backup so
      // we don't keep trying to migrate on every launch
      const backupPath = saveAsBackup(legacyCfgPath);
      notify(
        'Hyper 3',
        `Settings location has changed to ${cfgPath}.\nWe've backed up your old Hyper config to ${backupPath}`
      );
      return;
    }
  }

  // Migrate
  copySync(legacyCfgPath, cfgPath);
  saveAsBackup(legacyCfgPath);

  notify(
    'Hyper 3',
    `Settings location has changed to ${cfgPath}.\nWe've automatically migrated your existing config!\nPlease restart Hyper now`
  );
};

const _importConf = () => {
  // init plugin directories if not present
  mkdirpSync(plugs.base);
  mkdirpSync(plugs.local);

  try {
    migrateHyper2Config();
  } catch (err) {
    console.error(err);
  }

  let defaultCfgRaw = '';
  try {
    defaultCfgRaw = readFileSync(defaultCfg, 'utf8');
  } catch (err) {
    console.log(err);
  }
  const _defaultCfg = _extractDefault(defaultCfgRaw) as rawConfig;

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
  let userCfg: string;
  try {
    userCfg = readFileSync(cfgPath, 'utf8');
  } catch (err) {
    _write(cfgPath, defaultCfgRaw);
    userCfg = defaultCfgRaw;
  }

  return {userCfg, defaultCfg: _defaultCfg};
};

export const _import = () => {
  const imported = _importConf();
  defaultConfig = imported.defaultCfg;
  const result = _init(imported);
  return result;
};

export const getDefaultConfig = () => {
  if (!defaultConfig) {
    defaultConfig = _importConf().defaultCfg;
  }
  return defaultConfig;
};
