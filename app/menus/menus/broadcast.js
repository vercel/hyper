const {accelerators} = require('../../accelerators');

module.exports = function () {
  return {
    label: 'Broadcast',
    submenu: [
      {
        label: 'All panes in all tabs',
        accelerator: accelerators.broadcastAllTabsAllPanes,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('broadcast all req');
          }
        }
      },
      {
        label: 'All panes in current tab',
        accelerator: accelerators.broadcastAllTabsCurrentPane,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('broadcast current tab req');
          }
        }
      },
      {
        label: 'Current session only',
        accelerator: accelerators.boradcastCurrentTab,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('broadcast one req');
          }
        }
      },
    ]
  };
};
