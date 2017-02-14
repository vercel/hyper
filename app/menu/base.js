const os = require('os');
const path = require('path');
const {app, shell, dialog} = require('electron');

module.exports = class Menu {
  constructor(commands, createWindow, updatePlugins) {
    this.commands = commands;

    this.viewMenu = require('./subs/view')(commands);
    this.shellMenu = require('./subs/shell')(commands, createWindow);
    this.editMenu = require('./subs/edit')(commands);
    this.pluginsMenu = require('./subs/plugins-menu')(commands, updatePlugins);
    this.windowMenu = require('./subs/window')(commands);
    this.helpMenu = require('./subs/help')(os, app, shell);

    if (process.platform === 'darwin') {
      this.osxMenu = require('./subs/osx-menu')(commands, createWindow);
    } else {
      this.editMenu.submenu.push(
        {type: 'separator'},
        {
          label: 'Preferences...',
          accelerator: commands['window:preferences'],
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('preferences');
            } else {
              createWindow(win => win.rpc.emit('preferences'));
            }
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
