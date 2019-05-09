const {moveSync, copySync, existsSync, writeFileSync, readFileSync, lstatSync} = require('fs-extra');
const {sync: mkdirpSync} = require('mkdirp');
const {defaultCfg, cfgPath, legacyCfgPath, plugs, defaultPlatformKeyPath} = require('./paths');
const {_init, _extractDefault} = require('./init');
const notify = require('../notify');

let defaultConfig;

const _write = function(path, data) {
  // This method will take text formatted as Unix line endings and transform it
  // to text formatted with DOS line endings. We do this because the default
  // text editor on Windows (notepad) doesn't Deal with LF files. Still. In 2017.
  const crlfify = function(str) {
    return str.replace(/\r?\n/g, '\r\n');
  };
  const format = process.platform === 'win32' ? crlfify(data.toString()) : data;
  writeFileSync(path, format, 'utf8');
};

// Saves a file as backup by appending '.backup' or '.backup2', '.backup3', etc.
// so as to not override any existing files
const saveAsBackup = src => {
  let attempt = 1;
  while (attempt < 100) {
    try {
      const backupPath = src + '.backup' + (attempt === 1 ? '' : attempt);
      moveSync(src, backupPath);
      return backupPath;
    } catch (e) {
      if (e.code === 'EEXIST') {
        attempt++;
      } else {
        throw e;
      }
    }
  }
  throw new Error('Failed to create backup for config file. Too many backups');
};

const migrate = (old, _new, oldBackupPath) => {
  if (old === _new) {
    return;
  }
  if (existsSync(old)) {
    //eslint-disable-next-line no-console
    console.log('Found legacy config. Migrating ', old, '->', _new);
    if (existsSync(_new)) {
      saveAsBackup(_new);
    }
    copySync(old, _new);
    saveAsBackup(oldBackupPath || old);
    return true;
  }
  return false;
};

const _importConf = function() {
  // init plugin directories if not present
  mkdirpSync(plugs.base);

  try {
    // Migrate Hyper2 config to Hyper3 but only if the user hasn't manually
    // touched the new config and if the old config is not a symlink
    const hasNewConfigBeingTouched =
      existsSync(cfgPath) && readFileSync(cfgPath, 'utf8') !== readFileSync(defaultCfg, 'utf8');
    const isOldConfigSymlink = existsSync(legacyCfgPath) && lstatSync(legacyCfgPath).isSymbolicLink();
    if (!hasNewConfigBeingTouched && !isOldConfigSymlink) {
      const migratedConfig = migrate(legacyCfgPath, cfgPath);
      const migratedPlugins = migrate(plugs.legacyLocal, plugs.local, plugs.legacyBase);
      if (migratedConfig || migratedPlugins) {
        notify(
          'Hyper 3',
          `Settings location has changed to ${cfgPath}.\nWe've automatically migrated your existing config!\nPlease restart hyper`
        );
      }
    }
  } catch (e) {
    //eslint-disable-next-line no-console
    console.log(e);
  }

  // Run this after the migration so that we don't generate a ".backup" file for
  // an empty local/ directory
  mkdirpSync(plugs.local);

  try {
    const defaultCfgRaw = readFileSync(defaultCfg, 'utf8');
    const _defaultCfg = _extractDefault(defaultCfgRaw);
    // Importing platform specific keymap
    try {
      const content = readFileSync(defaultPlatformKeyPath(), 'utf8');
      const mapping = JSON.parse(content);
      _defaultCfg.keymaps = mapping;
    } catch (err) {
      //eslint-disable-next-line no-console
      console.error(err);
    }

    // Import user config
    try {
      const userCfg = readFileSync(cfgPath, 'utf8');
      return {userCfg, defaultCfg: _defaultCfg};
    } catch (err) {
      _write(cfgPath, defaultCfgRaw);
      return {userCfg: defaultCfgRaw, defaultCfg: _defaultCfg};
    }
  } catch (err) {
    //eslint-disable-next-line no-console
    console.log(err);
  }
};

exports._import = () => {
  const imported = _importConf();
  defaultConfig = imported.defaultCfg;
  const result = _init(imported);
  return result;
};

exports.getDefaultConfig = () => {
  if (!defaultConfig) {
    defaultConfig = _extractDefault(_importConf().defaultCfg);
  }
  return defaultConfig;
};
