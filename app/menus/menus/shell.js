module.exports = (commands, createWindow) => {
  const isMac = process.platform === 'darwin';

  return {
    label: isMac ? 'Shell' : 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: commands['window:new']
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
        accelerator: commands['pane:splitVertical']
      },
      {
        label: 'Split Horizontally',
        accelerator: commands['pane:splitHorizontal']
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
        label: isMac ? 'Close Window' : 'Quit',
        role: 'close',
        accelerator: commands['window:close']
      }
    ]
  };
};
