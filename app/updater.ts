// Packages
import electron, {app} from 'electron';
import type {BrowserWindow, AutoUpdater} from 'electron';

import retry from 'async-retry';
import ms from 'ms';

// Utilities
import autoUpdaterLinux from './auto-updater-linux';
import {getDefaultProfile} from './config';
import {version} from './package.json';
import {getDecoratedConfig} from './plugins';

const {platform} = process;
const isLinux = platform === 'linux';

const autoUpdater: AutoUpdater = isLinux ? autoUpdaterLinux : electron.autoUpdater;

const getDecoratedConfigWithRetry = async () => {
  return await retry(() => {
    const content = getDecoratedConfig(getDefaultProfile());
    if (!content) {
      throw new Error('No config content loaded');
    }
    return content;
  });
};

const checkForUpdates = async () => {
  const config = await getDecoratedConfigWithRetry();
  if (!config.disableAutoUpdates) {
    autoUpdater.checkForUpdates();
  }
};

let isInit = false;
// Default to the "stable" update channel
let canaryUpdates = false;

const buildFeedUrl = (canary: boolean, currentVersion: string) => {
  const updatePrefix = canary ? 'releases-canary' : 'releases';
  const archSuffix = process.arch === 'arm64' || app.runningUnderARM64Translation ? '_arm64' : '';
  return `https://${updatePrefix}.hyper.is/update/${isLinux ? 'deb' : platform}${archSuffix}/${currentVersion}`;
};

const isCanary = (updateChannel: string) => updateChannel === 'canary';

async function init() {
  autoUpdater.on('error', (err) => {
    console.error('Error fetching updates', `${err.message} (${err.stack})`);
  });

  const config = await getDecoratedConfigWithRetry();

  // If defined in the config, switch to the "canary" channel
  if (config.updateChannel && isCanary(config.updateChannel)) {
    canaryUpdates = true;
  }

  const feedURL = buildFeedUrl(canaryUpdates, version);

  autoUpdater.setFeedURL({url: feedURL});

  setTimeout(() => {
    void checkForUpdates();
  }, ms('10s'));

  setInterval(() => {
    void checkForUpdates();
  }, ms('30m'));

  isInit = true;
}

const updater = (win: BrowserWindow) => {
  if (!isInit) {
    void init();
  }

  const {rpc} = win;

  const onupdate = (ev: Event, releaseNotes: string, releaseName: string, date: Date, updateUrl: string) => {
    const releaseUrl = updateUrl || `https://github.com/vercel/hyper/releases/tag/${releaseName}`;
    rpc.emit('update available', {releaseNotes, releaseName, releaseUrl, canInstall: !isLinux});
  };

  if (isLinux) {
    autoUpdater.on('update-available', onupdate);
  } else {
    autoUpdater.on('update-downloaded', onupdate);
  }

  rpc.once('quit and install', () => {
    autoUpdater.quitAndInstall();
  });

  app.config.subscribe(async () => {
    const {updateChannel} = await getDecoratedConfigWithRetry();
    const newUpdateIsCanary = isCanary(updateChannel);

    if (newUpdateIsCanary !== canaryUpdates) {
      const feedURL = buildFeedUrl(newUpdateIsCanary, version);

      autoUpdater.setFeedURL({url: feedURL});
      void checkForUpdates();

      canaryUpdates = newUpdateIsCanary;
    }
  });

  win.on('close', () => {
    if (isLinux) {
      autoUpdater.removeListener('update-available', onupdate);
    } else {
      autoUpdater.removeListener('update-downloaded', onupdate);
    }
  });
};

export default updater;
