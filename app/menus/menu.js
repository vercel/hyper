const os = require('os');
const path = require('path');
const {app, shell} = require('electron');
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
    const configFile = path.resolve(config.getConfigDir(), _paths.conf);

    this.viewMenu = viewMenu(accelerators);
    this.shellMenu = shellMenu(accelerators, createWindow);
    this.editMenu = editMenu(accelerators, shell, configFile);
    this.pluginsMenu = pluginsMenu(accelerators, updatePlugins);
    this.windowMenu = windowMenu(accelerators);
    this.helpMenu = helpMenu(os, app, shell, _paths.icon);

    if (process.platform === 'darwin') {
      this.darwinMenu = darwinMenu(accelerators, configFile);
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
