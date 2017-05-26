const {getKeymaps} = require('../config');

// menus
const viewMenu = require('./menus/view');
const shellMenu = require('./menus/shell');
const editMenu = require('./menus/edit');
const pluginsMenu = require('./menus/plugins');
const windowMenu = require('./menus/window');
const helpMenu = require('./menus/help');
const darwinMenu = require('./menus/darwin');

module.exports = (createWindow, updatePlugins) => {
  const commands = getKeymaps().commands;
  const menu = [].concat(
    shellMenu(commands, createWindow),
    editMenu(commands),
    viewMenu(commands),
    pluginsMenu(commands, updatePlugins),
    windowMenu(commands),
    helpMenu(commands)
  );

  if (process.platform === 'darwin') {
    menu.unshift(
      darwinMenu(commands)
    );
  }

  return menu;
};
