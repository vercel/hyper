const { autoUpdater, dialog } = require('electron');
// const { version } = require('./package');
const version = '0.3.0'; // to force update available

const FEED_URL = 'https://nuts-serve-nxchetcjig.now.sh/update/osx';

module.exports = function AutoUpdater (rpc) {
  autoUpdater.on('error', (err, msg) => {
    dialog.showMessageBox({
      title: 'title',
      message: 'Auto updater error: ' + msg + ' (' + err.stack + ')',
      buttons: ['Ok']
    });
  });

  autoUpdater.setFeedURL(`${FEED_URL}/${version}`);

  autoUpdater.once('update-downloaded', () => {
    rpc.emit('update-available');
  });

  rpc.once('quit-and-install', () => {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.checkForUpdates();
};
