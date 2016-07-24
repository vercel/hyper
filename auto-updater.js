const { autoUpdater } = require('electron');
const { version } = require('./package');
const notify = require('./notify'); // eslint-disable-line no-unused-vars
const ms = require('ms');

const FEED_URL = process.platform === 'darwin' ? 'https://hyperterm-updates.now.sh/update/osx' : '';
let isInit = false;

function init () {
  autoUpdater.on('error', (err, msg) => {
    console.error('Error fetching updates', msg + ' (' + err.stack + ')');
  });

  autoUpdater.setFeedURL(`${FEED_URL}/${version}`);

  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, ms('10s'));

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, ms('5m'));

  isInit = true;
}

module.exports = function (win) {
  if (!isInit) init();

  const { rpc } = win;

  const onupdate = (ev, releaseNotes, releaseName) => {
    rpc.emit('update available', { releaseNotes, releaseName });
  };

  autoUpdater.on('update-downloaded', onupdate);

  rpc.once('quit and install', () => {
    autoUpdater.quitAndInstall();
  });

  win.on('close', () => {
    autoUpdater.removeListener('update-downloaded', onupdate);
  });
};
