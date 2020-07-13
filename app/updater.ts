// Packages
import electron, {app, BrowserWindow, AutoUpdater} from 'electron';
import ms from 'ms';
import retry from 'async-retry';

// Utilities
import {version} from './package.json';
import {getDecoratedConfig} from './plugins';
import autoUpdaterLinux from './auto-updater-linux';

const {platform} = process;
const isLinux = platform === 'linux';

const autoUpdater: AutoUpdater = isLinux ? autoUpdaterLinux : electron.autoUpdater;

let isInit = false;
// Default to the "stable" update channel
let canaryUpdates = false;

const buildFeedUrl = (canary: boolean, currentVersion: string) => {
  const updatePrefix = canary ? 'releases-canary' : 'releases';
  return `https://${updatePrefix}.hyper.is/update/${isLinux ? 'deb' : platform}/${currentVersion}`;
};

const isCanary = (updateChannel: string) => updateChannel === 'canary';

async function init() {
  autoUpdater.on('error', (err) => {
    console.error('Error fetching updates', `${err.message} (${err.stack})`);
  });

  const config = await retry(async () => {
    const content = await getDecoratedConfig();

    if (!content) {
      throw new Error('No config content loaded');
    }

    return content;
  });

  // If defined in the config, switch to the "canary" channel
  if (config.updateChannel && isCanary(config.updateChannel)) {
    canaryUpdates = true;
  }

  const feedURL = buildFeedUrl(canaryUpdates, version);

  autoUpdater.setFeedURL({url: feedURL});

  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, ms('10s'));

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, ms('30m'));

  isInit = true;
}

export default (win: BrowserWindow) => {
  if (!isInit) {
    init();
  }

  const {rpc} = win;

  const onupdate = (
    ev: Event,
    releaseNotes: string,
    releaseName: string,
    date: Date,
    updateUrl: string,
    onQuitAndInstall: any
  ) => {
    const releaseUrl = updateUrl || `https://github.com/vercel/hyper/releases/tag/${releaseName}`;
    rpc.emit('update available', {releaseNotes, releaseName, releaseUrl, canInstall: !!onQuitAndInstall});
  };

  const eventName: any = isLinux ? 'update-available' : 'update-downloaded';

  autoUpdater.on(eventName, onupdate);

  rpc.once('quit and install', () => {
    autoUpdater.quitAndInstall();
  });

  app.config.subscribe(() => {
    const {updateChannel} = app.plugins.getDecoratedConfig();
    const newUpdateIsCanary = isCanary(updateChannel);

    if (newUpdateIsCanary !== canaryUpdates) {
      const feedURL = buildFeedUrl(newUpdateIsCanary, version);

      autoUpdater.setFeedURL({url: feedURL});
      autoUpdater.checkForUpdates();

      canaryUpdates = newUpdateIsCanary;
    }
  });

  win.on('close', () => {
    autoUpdater.removeListener(eventName, onupdate);
  });
};
