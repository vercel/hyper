// Packages
const {autoUpdater} = require('electron');
const ms = require('ms');
const retry = require('async-retry');

// Utilities
const notify = require('./notify'); // eslint-disable-line no-unused-vars
const {version} = require('./package');
const {getConfig} = require('./config');

const {platform} = process;

let isInit = false;

function init() {
  autoUpdater.on('error', (err, msg) => {
    console.error('Error fetching updates', msg + ' (' + err.stack + ')');
  });

  const config = retry(() => {
    const content = getConfig();

    if (!content) {
      throw new Error('No config content loaded');
    }

    return content
  });

  // Default to the "stable" update channel
  let canaryUpdates = false;

  // If defined in the config, switch to the "canary" channel
  if (config.updateChannel && config.updateChannel === 'canary') {
    canaryUpdates = true;
  }

  const updatePrefix = canaryUpdates ? 'releases-canary' : 'releases';
  const feedURL = `https://${updatePrefix}.hyper.is/update/${platform}`;

  autoUpdater.setFeedURL(`${feedURL}/${version}`);

  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, ms('10s'));

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, ms('30m'));

  isInit = true;
}

module.exports = function (win) {
  if (!isInit) {
    init();
  }

  const {rpc} = win;

  const onupdate = (ev, releaseNotes, releaseName) => {
    rpc.emit('update available', {releaseNotes, releaseName});
  };

  autoUpdater.on('update-downloaded', onupdate);

  rpc.once('quit and install', () => {
    autoUpdater.quitAndInstall();
  });

  win.on('close', () => {
    autoUpdater.removeListener('update-downloaded', onupdate);
  });
};
