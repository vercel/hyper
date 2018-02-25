const {cfgPath} = require('./paths');
const fs = require('fs');
const recast = require('recast');

function toggleUpdateChannel() {
  let updateChannel = '';
  let configFile = '';

  // Search the config file for the property with the name 'updateChannel'
  try {
    // Get the config file using recast
    configFile = recast.parse(getFileContents(cfgPath));

    // Search the config file for the property with the name 'updateChannel'
    updateChannel = configFile.program.body[0].expression.right.properties
      .find(property => property.key.name === 'config')
      .value.properties.find(property => property.key.name === 'updateChannel').value.value;
  } catch (err) {
    return;
  }

  // select the new value for update channel
  updateChannel = updateChannel === 'canary' ? 'stable' : 'canary';
  configFile.program.body[0].expression.right.properties
    .find(property => property.key.name === 'config')
    .value.properties.find(property => property.key.name === 'updateChannel').value.value = updateChannel;

  // write to the config file
  const output = recast.print(configFile).code;
  fs.writeFileSync(cfgPath, output, 'utf8');
}

function getFileContents(fileName) {
  try {
    return fs.readFileSync(fileName, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
  return null;
}

module.exports = {
  toggleUpdateChannel
};
