const {accelerators} = require('../../accelerators');

module.exports = function () {
  return {
    role: 'window',
    submenu: [
      {
        role: 'minimize',
        accelerator: accelerators.minimize
      },
      {
        role: 'zoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Select Tab',
        submenu: [
          {
            label: 'Previous',
            accelerator: accelerators.showPreviousTab,
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('move left req');
              }
            }
          },
          {
            label: 'Next',
            accelerator: accelerators.showNextTab,
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('move right req');
              }
            }
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: 'Select Pane',
        submenu: [
          {
            label: 'Previous',
            accelerator: accelerators.selectNextPane,
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('prev pane req');
              }
            }
          },
          {
            label: 'Next',
            accelerator: accelerators.selectPreviousPane,
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('next pane req');
              }
            }
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        role: 'front'
      },
      {
        role: 'togglefullscreen',
        accelerators: accelerators.enterFullScreen
      }
    ]
  };
};
