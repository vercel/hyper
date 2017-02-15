module.exports = function (commands) {
  return {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: commands['window:reload'],
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('reload');
          }
        }
      },
      {
        label: 'Full Reload',
        accelerator: commands['window:reloadFull'],
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      },
      {
        label: 'Developer Tools',
        accelerator: commands['window:devtools'],
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
        accelerator: commands['zoom:reset'],
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('reset fontSize req');
          }
        }
      },
      {
        label: 'Zoom In',
        accelerator: commands['zoom:in'],
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('increase fontSize req');
          }
        }
      },
      {
        label: 'Zoom Out',
        accelerator: commands['zoom:out'],
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('decrease fontSize req');
          }
        }
      }
    ]
  };
};
