module.exports = commands => {
  return {
    role: 'window',
    submenu: [
      {
        role: 'minimize',
        accelerator: commands['window:minimize']
      },
      {
        type: 'separator'
      },
      {
        // It's the same thing as clicking the green traffc-light on macOS
        role: 'zoom',
        accelerator: commands['window:zoom']
      },
      {
        label: 'Select Tab',
        submenu: [
          {
            label: 'Previous',
            accelerator: commands['tab:prev']
          },
          {
            label: 'Next',
            accelerator: commands['tab:next']
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: 'Select Pane',
        submenu: [
          {
            label: 'Previous',
            accelerator: commands['pane:prev']
          },
          {
            label: 'Next',
            accelerator: commands['pane:next']
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        role: 'front'
      },
      {
        role: 'togglefullscreen',
        accelerators: commands['window:toggleFullScreen']
      }
    ]
  };
};
