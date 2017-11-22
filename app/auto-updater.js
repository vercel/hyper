// Packages
const {autoUpdater, app} = require('electron');
const ms = require('ms');
const retry = require('async-retry');

// Utilities
// eslint-disable-next-line no-unused-vars
const notify = require('./notify');
const {version} = require('./package');
const {getConfig} = require('./config');

const {platform} = process;

let isInit = false;
// Default to the "stable" update channel
let canaryUpdates = false;

const buildFeedUrl = canary => {
  const updatePrefix = canary ? 'releases-canary' : 'releases';
  return `https://${updatePrefix}.hyper.is/update/${platform}`;
};

const isCanary = updateChannel => updateChannel === 'canary';

async function init() {
  autoUpdater.on('error', (err, msg) => {
    //eslint-disable-next-line no-console
    console.error('Error fetching updates', msg + ' (' + err.stack + ')');
  });

  const config = await retry(async () => {
    const content = await getConfig();

    if (!content) {
      throw new Error('No config content loaded');
    }

    return content;
  });

  // If defined in the config, switch to the "canary" channel
  if (config.updateChannel && isCanary(config.updateChannel)) {
    canaryUpdates = true;
  }

  const feedURL = buildFeedUrl(canaryUpdates);

  autoUpdater.setFeedURL(`${feedURL}/${version}`);

  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, ms('10s'));

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, ms('30m'));

  isInit = true;
}

module.exports = win => {
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

  app.config.subscribe(() => {
    const {updateChannel} = app.plugins.getDecoratedConfig();
    const newUpdateIsCanary = isCanary(updateChannel);

    if (newUpdateIsCanary !== canaryUpdates) {
      const feedURL = buildFeedUrl(newUpdateIsCanary);

      autoUpdater.setFeedURL(`${feedURL}/${version}`);
      autoUpdater.checkForUpdates();

      canaryUpdates = newUpdateIsCanary;
    }
  });

  win.on('close', () => {
    autoUpdater.removeListener('update-downloaded', onupdate);
  });
};
