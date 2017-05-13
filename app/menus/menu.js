const os = require('os');
const path = require('path');
const {app, shell, dialog} = require('electron');
const _paths = require('../config/paths');

// menus
const viewMenu = require('./menus/view');
const shellMenu = require('./menus/shell');
const editMenu = require('./menus/edit');
const pluginsMenu = require('./menus/plugins');
const windowMenu = require('./menus/window');
const helpMenu = require('./menus/help');
const darwinMenu = require('./menus/darwin');

module.exports = class Menu {
  constructor(commands, createWindow, updatePlugins) {
    this.commands = commands;

    this.viewMenu = viewMenu(commands);
    this.shellMenu = shellMenu(commands, createWindow);
    this.editMenu = editMenu(commands);
    this.pluginsMenu = pluginsMenu(commands, updatePlugins);
    this.windowMenu = windowMenu(commands);
    this.helpMenu = helpMenu(os, app, shell);

    if (process.platform === 'darwin') {
      this.darwinMenu = darwinMenu(commands, _paths.prodConf);
    } else {
      this.editMenu.submenu.push(
        {type: 'separator'},
        {
          label: 'Preferences...',
          accelerator: commands['window:preferences'],
          click() {
            shell.openItem(_paths.prodConf);
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
