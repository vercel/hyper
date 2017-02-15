const os = require('os');
const path = require('path');
const {app, shell, dialog} = require('electron');
const {getConfigDir} = require('../config');


module.exports = class Menu {
  constructor(commands, createWindow, updatePlugins) {
    this.commands = commands;

    this.viewMenu = require('./menu/view')(commands);
    this.shellMenu = require('./menu/shell')(commands, createWindow);
    this.editMenu = require('./menu/edit')(commands);
    this.pluginsMenu = require('./menu/plugins')(commands, updatePlugins);
    this.windowMenu = require('./menu/window')(commands);
    this.helpMenu = require('./menu/help')(os, app, shell);

    if (process.platform === 'darwin') {
      this.osxMenu = require('./subs/darwin')(commands, createWindow);
    } else {
      this.editMenu.submenu.push(
        {type: 'separator'},
        {
          label: 'Preferences...',
          accelerator: commands['window:preferences'],
          click() {
            const configFile = path.resolve(getConfigDir(), '.hyper.js');
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
      menu.unshift(this.osxMenu);
    }

    return menu;
  }
};
