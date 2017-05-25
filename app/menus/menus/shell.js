module.exports = function (isMac, commands, createWindow) {
  return {
    label: isMac ? 'Shell' : 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: commands.newWindow,
        click() {
          createWindow();
        }
      },
      {
        label: 'New Tab',
        accelerator: commands.newTab,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('termgroup add req');
          } else {
            createWindow();
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Split Vertically',
        accelerator: commands.splitVertically,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('split request vertical');
          }
        }
      },
      {
        label: 'Split Horizontally',
        accelerator: commands.splitHorizontally,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('split request horizontal');
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Close Session',
        accelerator: commands.closeSession,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('termgroup close req');
          }
        }
      },
      {
        label: isMac ? 'Close Window' : 'Quit',
        role: 'close',
        accelerator: commands.closeWindow
      }
    ]
  };
};
