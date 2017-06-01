const {accelerators} = require('../../accelerators');

module.exports = function () {
  return {
    label: 'Broadcast',
    submenu: [
      {
        label: 'All panes in all tabs',
        accelerator: accelerators.broadcastAllTabsAllPanes
      },
      {
        label: 'All panes in current tab',
        accelerator: accelerators.broadcastAllTabsCurrentPane
      },
      {
        label: 'Current session only',
        accelerator: accelerators.boradcastCurrentTab
      },
    ]
  };
};
