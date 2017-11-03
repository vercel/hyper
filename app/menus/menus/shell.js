module.exports = (commandKeys, execCommand) => {
  const isMac = process.platform === 'darwin';

  return {
    label: isMac ? 'Shell' : 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: commandKeys['window:new'],
        click(item, focusedWindow) {
          execCommand('window:new', focusedWindow);
        }
      },
      {
        label: 'New Tab',
        accelerator: commandKeys['tab:new'],
        click(item, focusedWindow) {
          execCommand('tab:new', focusedWindow);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Split Vertically',
        accelerator: commandKeys['pane:splitVertical'],
        click(item, focusedWindow) {
          execCommand('pane:splitVertical', focusedWindow);
        }
      },
      {
        label: 'Split Horizontally',
        accelerator: commandKeys['pane:splitHorizontal'],
        click(item, focusedWindow) {
          execCommand('pane:splitHorizontal', focusedWindow);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Close Session',
        accelerator: commandKeys['pane:close'],
        click(item, focusedWindow) {
          execCommand('pane:close', focusedWindow);
        }
      },
      {
        label: isMac ? 'Close Window' : 'Quit',
        role: 'close',
        accelerator: commandKeys['window:close']
      }
    ]
  };
};
