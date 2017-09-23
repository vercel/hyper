const {release} = require('os');
const {app, shell} = require('electron');
const {getConfig, getPlugins} = require('../../config.js');

const appName = app.getName();
const appVersion = app.getVersion();

module.exports = function (commands, showAbout) {
  const submenu = [
    {
      label: `${appName} Website`,
      click() {
        shell.openExternal('https://hyper.is');
      }
    },
    {
      label: 'Report Issue',
      click() {
        /* line 23 thru 27 is from app/menus/menu.js
         need help figuring out how to import; the following wouldn't work:
         const {updateChannel} = require('../menu'); */
        const config = getConfig();
        let updateChannel = 'stable';
        if (config && config.updateChannel && config.updateChannel === 'canary') {
          updateChannel = 'canary';
        }

        const body = `
        <!-- Please succinctly describe your issue and steps to reproduce it. -->
        -
        ${appName} ${appVersion} (${updateChannel})
        Electron ${process.versions.electron}
        ${process.platform} ${process.arch} ${release()}
        ${JSON.stringify(getConfig(), null, 2)}
        ${JSON.stringify(getPlugins(), null, 2)}
        `;

        shell.openExternal(`https://github.com/zeit/hyper/issues/new?body=${encodeURIComponent(body)}`);
      }
    }
  ];

  if (process.platform !== 'darwin') {
    submenu.push(
      {type: 'separator'},
      {
        role: 'about',
        click() {
          showAbout();
        }
      }
    );
  }

  return {
    role: 'help',
    submenu
  };
};
