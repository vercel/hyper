const editMenu = require('../menus/menus/edit');
const shellMenu = require('../menus/menus/shell');
const {execCommand} = require('../commands');
const {getDecoratedKeymaps} = require('../plugins');
const separator = {type: 'separator'};

const allCommandKeys = getDecoratedKeymaps();
const commandKeys = Object.keys(allCommandKeys).reduce((result, command) => {
  result[command] = allCommandKeys[command][0];
  return result;
}, {});

// only display cut/copy when there's a cursor selection
const filterCutCopy = (selection, menuItem) => {
  if (/^cut$|^copy$/.test(menuItem.role) && !selection) {
    return;
  }
  return menuItem;
};

module.exports = (createWindow, selection) => {
  const _shell = shellMenu(commandKeys, execCommand).submenu;
  const _edit = editMenu(commandKeys, execCommand).submenu.filter(filterCutCopy.bind(null, selection));
  return _edit.concat(separator, _shell).filter(menuItem => !menuItem.hasOwnProperty('enabled') || menuItem.enabled);
};
