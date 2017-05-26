const {accelerators} = require('../../accelerators');

module.exports = function (createWindow) {
  const isMac = process.platform === 'darwin';

  return {
    label: isMac ? 'Shell' : 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: accelerators.newWindow,
        click() {
          createWindow();
        }
      },
      {
        label: 'New Tab',
        accelerator: accelerators.newTab,
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
        accelerator: accelerators.splitVertically,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('split request vertical');
          }
        }
      },
      {
        label: 'Split Horizontally',
        accelerator: accelerators.splitHorizontally,
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
        accelerator: accelerators.closeSession,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('termgroup close req');
          }
        }
      },
      {
        label: isMac ? 'Close Window' : 'Quit',
        role: 'close',
        accelerator: accelerators.closeWindow
      }
    ]
  };
};
