/**
 * @fileoverview Upgrade legacy config paths to conventional.
 */

const {statSync, renameSync} = require('fs');

const {sync: mkdirpSync} = require('mkdirp');
const {sync: rimrafSync} = require('rimraf');

const exists = path => {
  try {
    statSync(path);

    return true;
  } catch (e) {
    return false;
  }
};

const checkLegacyConfig = ({configPath}) => exists(configPath);
const checkLegacyPlugins = ({pluginsRoot}) => exists(pluginsRoot);
const checkConventionalConfig = ({configPath}) => exists(configPath);
const checkConventionalPlugins = ({pluginsRoot}) => exists(pluginsRoot);

module.exports = (legacy, conventional) => {
  const legacyConfig = checkLegacyConfig(legacy);
  const legacyPlugins = checkLegacyPlugins(legacy);
  const conventionalConfig = checkConventionalConfig(conventional);
  const conventionalPlugins = checkConventionalPlugins(conventional);

  if (legacyConfig) {
    if (!conventionalConfig) {
      // eslint-disable-next-line no-console
      console.log('Moving config from legacy location to conventional.');
      mkdirpSync(conventional.dataRoot);
      renameSync(legacy.configPath, conventional.configPath);
    } else {
      // eslint-disable-next-line no-console
      console.log('Config is found at both legacy and conventional locations.');
      // eslint-disable-next-line no-console
      console.log('Config at `$HOME` will be ignored. Recommended to delete it to avoid bloating `$HOME`.');

      // rimrafSync(legacy.configPath);
    }
  }

  if (legacyPlugins) {
    if (!conventionalPlugins) {
      // eslint-disable-next-line no-console
      console.log('Moving plugins from legacy location to conventional.');
      mkdirpSync(conventional.dataRoot);
      renameSync(legacy.pluginsRoot, conventional.pluginsRoot);
    } else {
      // eslint-disable-next-line no-console
      console.log('Plugins are found at both legacy and conventional locations.');
      // eslint-disable-next-line no-console
      console.log('Plugins at `$HOME` will be ignored. Recommended to delete them to avoid bloating `$HOME`.');

      // rimrafSync(legacy.pluginsRoot);
    }
  }
};
