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
        accelerator: commands['window:devtools']
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
