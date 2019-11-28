import editMenu from '../menus/menus/edit';
import shellMenu from '../menus/menus/shell';
import {execCommand} from '../commands';
import {getDecoratedKeymaps} from '../plugins';
const separator = {type: 'separator'};

const getCommandKeys = keymaps =>
  Object.keys(keymaps).reduce((commandKeys, command) => {
    return Object.assign(commandKeys, {
      [command]: keymaps[command][0]
    });
  }, {});

// only display cut/copy when there's a cursor selection
const filterCutCopy = (selection, menuItem) => {
  if (/^cut$|^copy$/.test(menuItem.role) && !selection) {
    return;
  }
  return menuItem;
};

export default (createWindow, selection) => {
  const commandKeys = getCommandKeys(getDecoratedKeymaps());
  const _shell = shellMenu(commandKeys, execCommand).submenu;
  const _edit = editMenu(commandKeys, execCommand).submenu.filter(filterCutCopy.bind(null, selection));
  return _edit
    .concat(separator, _shell)
    .filter(menuItem => !Object.prototype.hasOwnProperty.call(menuItem, 'enabled') || menuItem.enabled);
};
