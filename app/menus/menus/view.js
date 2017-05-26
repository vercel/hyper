const {accelerators} = require('../../accelerators');

module.exports = function () {
  return {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: accelerators.reload,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('reload');
          }
        }
      },
      {
        label: 'Full Reload',
        accelerator: accelerators.fullReload,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      },
      {
        label: 'Developer Tools',
        accelerator: accelerators.toggleDevTools,
        click(item, focusedWindow) {
          if (focusedWindow) {
            const webContents = focusedWindow.webContents;
            if (webContents.isDevToolsOpened()) {
              webContents.closeDevTools();
            } else {
              webContents.openDevTools({mode: 'detach'});
            }
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Reset Zoom Level',
        accelerator: accelerators.resetZoom,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('reset fontSize req');
          }
        }
      },
      {
        label: 'Zoom In',
        accelerator: accelerators.zoomIn,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('increase fontSize req');
          }
        }
      },
      {
        label: 'Zoom Out',
        accelerator: accelerators.zoomOut,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('decrease fontSize req');
          }
        }
      }
    ]
  };
};
