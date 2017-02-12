module.exports = function (commands, createWindow) {
  return {
    label: 'Shell',
    submenu: [
      {
        label: 'New Window',
        accelerator: commands['window:new'],
        click() {
          createWindow();
        }
      },
      {
        label: 'New Tab',
        accelerator: commands['tab:new'],
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
        accelerator: commands['pane:vertical'],
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('split request vertical');
          }
        }
      },
      {
        label: 'Split Horizontally',
        accelerator: commands['pane:horizontal'],
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
        accelerator: commands['pane:close'],
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('termgroup close req');
          }
        }
      },
      {
        label: 'Close Window',
        role: 'close',
        accelerator: commands['window:close']
      }
    ]
  };
};
