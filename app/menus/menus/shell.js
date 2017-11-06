module.exports = (commandKeys, execCommand) => {
  const isMac = process.platform === 'darwin';

  return {
    label: isMac ? 'Shell' : 'File',
    submenu: [
      {
        label: 'New Tab',
        accelerator: commandKeys['tab:new'],
        click(item, focusedWindow) {
          execCommand('tab:new', focusedWindow);
        }
      },
      {
        label: 'New Window',
        accelerator: commandKeys['window:new'],
        click(item, focusedWindow) {
          execCommand('window:new', focusedWindow);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Split Horizontally',
        accelerator: commandKeys['pane:splitHorizontal'],
        click(item, focusedWindow) {
          execCommand('pane:splitHorizontal', focusedWindow);
        }
      },
      {
        label: 'Split Vertically',
        accelerator: commandKeys['pane:splitVertical'],
        click(item, focusedWindow) {
          execCommand('pane:splitVertical', focusedWindow);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Close',
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
