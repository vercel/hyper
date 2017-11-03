// Packages
const {app, dialog, Menu} = require('electron');

// Utilities
const {getConfig} = require('../config');
const {icon} = require('../config/paths');
const viewMenu = require('./menus/view');
const shellMenu = require('./menus/shell');
const editMenu = require('./menus/edit');
const pluginsMenu = require('./menus/plugins');
const windowMenu = require('./menus/window');
const helpMenu = require('./menus/help');
const darwinMenu = require('./menus/darwin');
const {getDecoratedKeymaps} = require('../plugins');
const {execCommand} = require('../commands');

const appName = app.getName();
const appVersion = app.getVersion();

let menu_ = [];

exports.createMenu = (createWindow, getLoadedPluginVersions) => {
  const config = getConfig();
  // We take only first shortcut in array for each command
  const allCommandKeys = getDecoratedKeymaps();
  const commandKeys = Object.keys(allCommandKeys).reduce((result, command) => {
    result[command] = allCommandKeys[command][0];
    return result;
  }, {});

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
    ...(process.platform === 'darwin' ? [darwinMenu(commandKeys, execCommand, showAbout)] : []),
    shellMenu(commandKeys, execCommand),
    editMenu(commandKeys, execCommand),
    viewMenu(commandKeys, execCommand),
    pluginsMenu(commandKeys, execCommand),
    windowMenu(commandKeys, execCommand),
    helpMenu(commandKeys, showAbout)
  ];

  return menu;
};

exports.buildMenu = template => {
  menu_ = Menu.buildFromTemplate(template);
  return menu_;
};
