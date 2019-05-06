const {writeFileSync, readFileSync} = require('fs');
const {moveSync} = require('fs-extra-p');
const {sync: mkdirpSync} = require('mkdirp');
const {defaultCfg, cfgPath, legacyCfgPath, plugs, defaultPlatformKeyPath} = require('./paths');
const {_init, _extractDefault} = require('./init');

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

const _importConf = function() {
  // init plugin directories if not present
  mkdirpSync(plugs.base);
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

    // Import old (Hyper2) config, if any
    let legacyCfg;
    if (legacyCfgPath !== cfgPath) {
      try {
        legacyCfg = readFileSync(legacyCfgPath, 'utf8');
      } catch (err) {
        // Do nothing
      }
    }

    // Import user config
    let userCfg;
    try {
      userCfg = readFileSync(cfgPath, 'utf8');
    } catch (err) {
      // Do nothing
    }

    // If a legacy config was found, migrate it to the new location while
    // keeping any old files with a '.backup' suffix
    if (legacyCfg) {
      //eslint-disable-next-line no-console
      console.log('Legacy config found in:', legacyCfgPath);
      if (userCfg) {
        const backupPath = saveAsBackup(cfgPath);
        //eslint-disable-next-line no-console
        console.log('Backing up existing config as', backupPath);
      }
      const backupPath = saveAsBackup(legacyCfgPath);
      //eslint-disable-next-line no-console
      console.log('Backing up existing legacy config as', backupPath);

      _write(cfgPath, legacyCfg);
      userCfg = legacyCfg;
    } else if (!userCfg) {
      //eslint-disable-next-line no-console
      console.log('No existing config found. Generating default at', cfgPath);
      _write(cfgPath, defaultCfgRaw);
      userCfg = defaultCfgRaw;
    }

    return {userCfg, defaultCfg: _defaultCfg};
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
