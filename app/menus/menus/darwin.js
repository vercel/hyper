// This menu label is overrided by OSX to be the appName
// The label is set to appName here so it matches actual behavior
const {app} = require('electron');

module.exports = (commandKeys, execCommand, showAbout) => {
  return {
    label: `${app.getName()}`,
    submenu: [
      {
        label: 'About Hyper',
        click() {
          showAbout();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Preferences...',
        accelerator: commandKeys['window:preferences'],
        click() {
          execCommand('window:preferences');
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
