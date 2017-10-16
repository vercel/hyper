const {shell} = require('electron');
const editMenu = require('../menus/menus/edit');
const shellMenu = require('../menus/menus/shell');
const {getKeymaps: commands} = require('../config');
const separator = {type: 'separator'};

module.exports = (createWindow, selection) => {
  const _shell = shellMenu(commands, createWindow).submenu;
  const _edit = editMenu(commands).submenu.filter(menuItem => {
    /* only display cut/copy when there's a cursor selection */
    if (/^cut$|^copy$/.test(menuItem.role) && !selection) {
      return
    }
    return menuItem
  });
  return _edit.concat(separator, _shell);
};
