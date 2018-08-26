/**
 * @fileoverview Upgrade legacy config paths to conventional.
 */

const { statSync, renameSync } = require('fs');

const { sync: mkdirpSync } = require('mkdirp');
const { sync: rimrafSync } = require('rimraf');

const exists = path => {
  try {
    statSync(path);

    return true;
  } catch (e) {
    return false;
  }
};

const checkLegacyConfig = ({ configPath }) => exists(configPath);
const checkLegacyPlugins = ({ pluginsRoot }) => exists(pluginsRoot);
const checkConventionalConfig = ({ configPath }) => exists(configPath);
const checkConventionalPlugins = ({ pluginsRoot }) => exists(pluginsRoot);

module.exports = (legacy, conventional) => {
  const legacyConfig = checkLegacyConfig(legacy);
  const legacyPlugins = checkLegacyPlugins(legacy);
  const conventionalConfig = checkConventionalConfig(conventional);
  const conventionalPlugins = checkConventionalPlugins(conventional);

  if (legacyConfig) {
    if (!conventionalConfig) {
      mkdirpSync(conventional.dataRoot);
      renameSync(legacy.configPath, conventional.configPath);
    } else {
      rimrafSync(legacy.configPath);
    }
  }

  if (legacyPlugins) {
    if (!conventionalPlugins) {
      mkdirpSync(conventional.dataRoot);
      renameSync(legacy.pluginsRoot, conventional.pluginsRoot);
    } else {
      rimrafSync(legacy.pluginsRoot);
    }
  }
}
