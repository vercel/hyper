module.exports = (commandKeys, execCommand) => {
  return {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: commandKeys['window:reload'],
        click(item, focusedWindow) {
          execCommand('window:reload', focusedWindow);
        }
      },
      {
        label: 'Full Reload',
        accelerator: commandKeys['window:reloadFull'],
        click(item, focusedWindow) {
          execCommand('window:reloadFull', focusedWindow);
        }
      },
      {
        label: 'Developer Tools',
        accelerator: commandKeys['window:devtools'],
        click: (item, focusedWindow) => {
          execCommand('window:devtools', focusedWindow);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Reset Zoom Level',
        accelerator: commandKeys['zoom:reset'],
        click(item, focusedWindow) {
          execCommand('zoom:reset', focusedWindow);
        }
      },
      {
        label: 'Zoom In',
        accelerator: commandKeys['zoom:in'],
        click(item, focusedWindow) {
          execCommand('zoom:in', focusedWindow);
        }
      },
      {
        label: 'Zoom Out',
        accelerator: commandKeys['zoom:out'],
        click(item, focusedWindow) {
          execCommand('zoom:out', focusedWindow);
        }
      }
    ]
  };
};
