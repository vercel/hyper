module.exports = (commands, createWindow) => {
  const isMac = process.platform === 'darwin';

  return {
    label: isMac ? 'Shell' : 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: commands['window:new'],
        click(item, focusedWindow) {
          if (!focusedWindow) {
            //Without focused window, it can't be intercepted by mousetrap
            createWindow();
          }
        }
      },
      {
        label: 'New Tab',
        accelerator: commands['tab:new'],
        click(item, focusedWindow) {
          if (!focusedWindow) {
            //Without focused window, it can't be intercepted by mousetrap
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
        accelerator: commands['pane:close']
      },
      {
        label: isMac ? 'Close Window' : 'Quit',
        role: 'close',
        accelerator: commands['window:close']
      }
    ]
  };
};
