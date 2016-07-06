const { autoUpdater, dialog } = require('electron');
// const { version } = require('./package');
const version = '0.3.0'; // to force update available

const FEED_URL = 'https://nuts-serve-nxchetcjig.now.sh/update/osx';

module.exports = function AutoUpdater (rpc) {
  autoUpdater.on('error', (err, msg) => {
    dialog.showMessageBox({title: 'title', message: JSON.stringify(err), buttons: ['Ok error']});
    dialog.showMessageBox({title: 'title', message: JSON.stringify(msg), buttons: ['Ok error']});
  });

  autoUpdater.setFeedURL(`${FEED_URL}/${version}`);

  autoUpdater.once('update-downloaded', () => {
    rpc.emit('update-available');
  });

  autoUpdater.once('update-available', () => {
    dialog.showMessageBox({title: 'title', message: 'update-available', buttons: ['Ok']});
  });

  autoUpdater.once('update-not-available', () => {
    dialog.showMessageBox({title: 'title', message: 'update-not-available', buttons: ['Ok']});
  });

  rpc.once('quit-and-install', () => {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.checkForUpdates();
};
