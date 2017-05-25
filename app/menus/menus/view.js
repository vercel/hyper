module.exports = function (commands) {
  return {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: commands.reload,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('reload');
          }
        }
      },
      {
        label: 'Full Reload',
        accelerator: commands.fullReload,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      },
      {
        label: 'Developer Tools',
        accelerator: commands.toggleDevTools,
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
        accelerator: commands.resetZoom,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('reset fontSize req');
          }
        }
      },
      {
        label: 'Zoom In',
        accelerator: commands.zoomIn,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('increase fontSize req');
          }
        }
      },
      {
        label: 'Zoom Out',
        accelerator: commands.zoomOut,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('decrease fontSize req');
          }
        }
      }
    ]
  };
};
