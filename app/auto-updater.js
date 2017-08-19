const {autoUpdater, app} = require('electron');
const ms = require('ms');
const isDev = require('electron-is-dev');

const notify = require('./notify'); // eslint-disable-line no-unused-vars
const {version} = require('./package');

const {platform} = process;
const FEED_URL = `https://releases.hyper.is/update/${platform}`;

const initialize = () => {
  if (!isDev && process.platform !== 'linux') {
    autoUpdater.on('error', (err, msg) => {
      console.error('Error fetching updates', msg + ' (' + err.stack + ')');
    });

    autoUpdater.setFeedURL(`${FEED_URL}/${version}`);
    autoUpdater.checkForUpdates();

    autoUpdater.on('checking-for-update', () => {
      setInterval(() => {
        autoUpdater.checkForUpdates();
      }, ms('30m'));
    });

    app.getWindows().forEach(win => {
      if (win) {
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
      }
    });
  } else {
    console.log('ignoring auto updates during dev');
  }
};

module.exports = {
  initialize
};
