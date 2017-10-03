// Packages
const {app, dialog, BrowserWindow, Menu} = require('electron');

// Utilities
const {getKeymaps, getConfig} = require('../config');
const {icon} = require('../config/paths');
const viewMenu = require('./menus/view');
const shellMenu = require('./menus/shell');
const editMenu = require('./menus/edit');
const pluginsMenu = require('./menus/plugins');
const windowMenu = require('./menus/window');
const helpMenu = require('./menus/help');
const darwinMenu = require('./menus/darwin');

const appName = app.getName();
const appVersion = app.getVersion();

let menu_ = [];

exports.createMenu = (createWindow, updatePlugins, getLoadedPluginVersions) => {
  const config = getConfig();
  const commands = getKeymaps();

  let updateChannel = 'stable';

  if (config && config.updateChannel && config.updateChannel === 'canary') {
    updateChannel = 'canary';
  }

  const showAbout = () => {
    const loadedPlugins = getLoadedPluginVersions();
    const pluginList =
      loadedPlugins.length === 0 ? 'none' : loadedPlugins.map(plugin => `\n  ${plugin.name} (${plugin.version})`);

    dialog.showMessageBox({
      title: `About ${appName}`,
      message: `${appName} ${appVersion} (${updateChannel})`,
      detail: `Plugins: ${pluginList}\n\nCreated by Guillermo Rauch\nCopyright © 2017 Zeit, Inc.`,
      buttons: [],
      icon
    });
  };
  const menu = [
    ...(process.platform === 'darwin' ? [darwinMenu(commands, showAbout)] : []),
    shellMenu(commands, createWindow),
    editMenu(commands),
    viewMenu(commands),
    pluginsMenu(commands, updatePlugins),
    windowMenu(commands),
    helpMenu(commands, showAbout)
  ];

  return menu;
};

exports.buildMenu = template => {
  menu_ = Menu.buildFromTemplate(template);
  return menu_;
};

// Find recursi
const findCommand = (command, menu) => {
  for (const idx in menu.items) {
    const menuItem = menu.items[idx];
    if (menuItem.command === command) {
      return menuItem;
    }
    if (menuItem.submenu) {
      const target = findCommand(command, menuItem.submenu);
      if (target) {
        return target;
      }
    }
  }

  return false;
};

exports.execCommand = command => {
  const menuItem = findCommand(command, menu_);
  if (!menuItem) {
    console.warn('menuItem not found for command', command, JSON.stringify(menu_));
    return;
  }
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const focusedwebContents = focusedWindow ? focusedWindow.webContents : undefined;
  menuItem.click(undefined, focusedWindow, focusedwebContents);
};
