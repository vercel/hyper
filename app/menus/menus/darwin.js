// This menu label is overrided by OSX to be the appName
// The label is set to appName here so it matches actual behavior
const {app, shell} = require('electron');
const {accelerators} = require('../../accelerators');
const {confPath} = require('../../config/paths');

module.exports = function () {
  return {
    label: `${app.getName()}`,
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Preferences...',
        accelerator: accelerators.preferences,
        click() {
          shell.openItem(confPath);
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  };
};
