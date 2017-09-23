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
<!--
  Hi there! Thank you for discovering and submitting an issue.

  Before you submit this; let's make sure of a few things.
  Please make sure the following boxes are ticked if they are correct.
  If not, please try and fulfil these first.
-->

<!-- Checked checkbox should look like this: [x] -->
  - [ ] I am on the [latest](https://github.com/zeit/hyper/releases/latest) Hyper.app version
  - [ ] I have searched the [issues](https://github.com/zeit/hyper/issues) of this repo and believe that this is not a duplicate

<!--
  Once those are done, if you're able to fill in the following list with your information,
  it'd be very helpful to whoever handles the issue.
-->

- **OS version and name**: <!-- Replace with version + name -->
- **Hyper.app version**: <!-- Replace with version -->
- **Link of a [Gist](https://gist.github.com/) with the contents of your .hyper.js**: <!-- Gist Link Here -->

  -
  My version is ${appName} ${appVersion} (${updateChannel})
  Electron ${process.versions.electron}
  ${process.platform} ${process.arch} ${release()}
  ${JSON.stringify(getConfig(), null, 2)}
  ${JSON.stringify(getPlugins(), null, 2)}

  - **Relevant information from devtools** _(CMD+ALT+I on Mac OS, CTRL+SHIFT+I elsewhere)_:
<!-- Replace with info if applicable, or N/A -->
  - **The issue is reproducible in vanilla Hyper.app**
<!-- Replace with info if applicable, or Is Vanilla. (Vanilla means Hyper.app without any add-ons or extras. Straight out of the box.) -->

## Issue
<!-- Now feel free to write your issue, but please be descriptive! Thanks again 🙌 ❤️ -->`;

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
