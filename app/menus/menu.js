const os = require('os');
const path = require('path');
const {app, shell, dialog} = require('electron');
const config = require('../config.js');
const _paths = require('../config/paths');
const {accelerators} = require('../accelerators');

// menus
const viewMenu = require('./menus/view');
const shellMenu = require('./menus/shell');
const editMenu = require('./menus/edit');
const pluginsMenu = require('./menus/plugins');
const windowMenu = require('./menus/window');
const helpMenu = require('./menus/help');
const darwinMenu = require('./menus/darwin');

module.exports = class Menu {
  constructor(createWindow, updatePlugins) {
    this.viewMenu = viewMenu(accelerators);
    this.shellMenu = shellMenu(process.platform === 'darwin', accelerators, createWindow);
    this.editMenu = editMenu(accelerators);
    this.pluginsMenu = pluginsMenu(accelerators, updatePlugins);
    this.windowMenu = windowMenu(accelerators);
    this.helpMenu = helpMenu(os, app, shell);

    const configFile = path.resolve(config.getConfigDir(), _paths.conf);

    if (process.platform === 'darwin') {
      this.darwinMenu = darwinMenu(accelerators, configFile);
    } else {
      this.editMenu.submenu.push(
        {type: 'separator'},
        {
          label: 'Preferences...',
          accelerator: accelerators.preferences,
          click() {
            shell.openItem(configFile);
          }
        }
      );

      this.helpMenu.submenu.push(
        {type: 'separator'},
        {
          role: 'about',
          click() {
            dialog.showMessageBox({
              title: `About ${app.getName()}`,
              message: `${app.getName()} ${app.getVersion()}`,
              detail: 'Created by Guillermo Rauch',
              icon: path.join(__dirname, 'static/icon.png'),
              buttons: []
            });
          }
        }
      );
    }
  }

  make() {
    const menu = [].concat(
      this.shellMenu,
      this.editMenu,
      this.viewMenu,
      this.pluginsMenu,
      this.windowMenu,
      this.helpMenu
    );

    if (process.platform === 'darwin') {
      menu.unshift(this.darwinMenu);
    }

    return menu;
  }
};
