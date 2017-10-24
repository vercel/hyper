module.exports = commands => {
  return {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: commands['window:reload']
      },
      {
        label: 'Full Reload',
        accelerator: commands['window:reloadFull']
      },
      {
        label: 'Developer Tools',
        accelerator: commands['window:devtools'],
        click: (item, focusedWindow) => {
          const webContents = focusedWindow.webContents;
          if (webContents.isDevToolsOpened()) {
            webContents.closeDevTools();
          } else {
            webContents.openDevTools({mode: 'detach'});
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Reset Zoom Level',
        accelerator: commands['zoom:reset']
      },
      {
        label: 'Zoom In',
        accelerator: commands['zoom:in']
      },
      {
        label: 'Zoom Out',
        accelerator: commands['zoom:out']
      }
    ]
  };
};
