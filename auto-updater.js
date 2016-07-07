const { autoUpdater, dialog } = require('electron');
const { version } = require('./package');

const FEED_URL = 'https://hyperterm-updates.now.sh/update/osx';

module.exports = function AutoUpdater (rpc) {
  autoUpdater.on('error', (err, msg) => {
    dialog.showMessageBox({
      title: 'title',
      message: 'Auto updater error: ' + msg + ' (' + err.stack + ')',
      buttons: ['Ok']
    });
  });

  autoUpdater.setFeedURL(`${FEED_URL}/${version}`);

  autoUpdater.once('update-downloaded', (ev, releaseNotes, releaseName) => {
    rpc.emit('update available', { releaseNotes, releaseName });
  });

  rpc.once('quit-and-install', () => {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.checkForUpdates();
};
