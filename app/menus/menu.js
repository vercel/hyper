// menus
const viewMenu = require('./menus/view');
const shellMenu = require('./menus/shell');
const editMenu = require('./menus/edit');
const pluginsMenu = require('./menus/plugins');
const windowMenu = require('./menus/window');
const broadcastMenu = require('./menus/broadcast');
const helpMenu = require('./menus/help');
const darwinMenu = require('./menus/darwin');

module.exports = (createWindow, updatePlugins) => {
  const menu = [].concat(
    shellMenu(createWindow),
    editMenu(),
    viewMenu(),
    pluginsMenu(updatePlugins),
    windowMenu(),
    broadcastMenu(),
    helpMenu()
  );

  if (process.platform === 'darwin') {
    menu.unshift(
      darwinMenu()
    );
  }

  return menu;
};
