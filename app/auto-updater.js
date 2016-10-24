const {autoUpdater} = require('electron');
const ms = require('ms');

const notify = require('./notify'); // eslint-disable-line no-unused-vars
const {version} = require('./package');

// accepted values: `osx`, `win32`
// https://nuts.gitbook.com/update-windows.html
const platform = process.platform === 'darwin' ?
  'osx' :
  process.platform;
const FEED_URL = `https://hyper-updates.now.sh/update/${platform}`;
let isInit = false;

function init() {
  autoUpdater.on('error', (err, msg) => {
    console.error('Error fetching updates', msg + ' (' + err.stack + ')');
  });

  autoUpdater.setFeedURL(`${FEED_URL}/${version}`);

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
