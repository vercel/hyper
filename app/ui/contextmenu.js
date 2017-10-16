const {shell} = require('electron');
const editMenu = require('../menus/menus/edit');
const shellMenu = require('../menus/menus/shell');
const {getKeymaps: commands} = require('../config');
const separator = {type: 'separator'};

const extendedMenu = selection => [
  separator,
  {
    label: 'Open Selection as URL',
    click() {
      shell.openExternal(selection);
    }
  },
  {
    label: 'Search the Web for Selection',
    click() {
      shell.openExternal(`https://www.google.com/search?q=${selection}`);
    }
  }
];

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
  const mainMenu = _edit.concat(separator, _shell);
  return selection ? mainMenu.concat(extendedMenu(selection)) : mainMenu;
};
