const editMenu = require('../menus/menus/edit');
const shellMenu = require('../menus/menus/shell');
const {getKeymaps: commands} = require('../config');
const separator = {type: 'separator'};

// only display cut/copy when there's a cursor selection
const filterCutCopy = (selection, menuItem) => {
  if (/^cut$|^copy$/.test(menuItem.role) && !selection) {
    return;
  }
  return menuItem;
};

module.exports = (createWindow, selection) => {
  const _shell = shellMenu(commands, createWindow).submenu;
  const _edit = editMenu(commands).submenu.filter(filterCutCopy.bind(null, selection));
  return _edit.concat(separator, _shell);
};
