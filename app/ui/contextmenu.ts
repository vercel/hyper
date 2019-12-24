import editMenu from '../menus/menus/edit';
import shellMenu from '../menus/menus/shell';
import {execCommand} from '../commands';
import {getDecoratedKeymaps} from '../plugins';
import {MenuItemConstructorOptions, BrowserWindow} from 'electron';
const separator: MenuItemConstructorOptions = {type: 'separator'};

const getCommandKeys = (keymaps: Record<string, string[]>): Record<string, string> =>
  Object.keys(keymaps).reduce((commandKeys: Record<string, string>, command) => {
    return Object.assign(commandKeys, {
      [command]: keymaps[command][0]
    });
  }, {});

// only display cut/copy when there's a cursor selection
const filterCutCopy = (selection: string, menuItem: MenuItemConstructorOptions) => {
  if (/^cut$|^copy$/.test(menuItem.role!) && !selection) {
    return;
  }
  return menuItem;
};

export default (
  createWindow: (fn?: (win: BrowserWindow) => void, options?: Record<string, any>) => BrowserWindow,
  selection: string
) => {
  const commandKeys = getCommandKeys(getDecoratedKeymaps());
  const _shell = shellMenu(commandKeys, execCommand).submenu as MenuItemConstructorOptions[];
  const _edit = editMenu(commandKeys, execCommand).submenu.filter(filterCutCopy.bind(null, selection));
  return _edit
    .concat(separator, _shell)
    .filter(menuItem => !Object.prototype.hasOwnProperty.call(menuItem, 'enabled') || menuItem.enabled);
};
