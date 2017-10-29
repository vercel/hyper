module.exports = commands => {
  // Generating tab:jump array
  const tabJump = [];
  for (let i = 1; i <= 9; i++) {
    // 9 is a special number because it means 'last'
    const label = i === 9 ? 'Last' : `${i}`;
    tabJump.push({
      label: label,
      accelerator: commands[`tab:jump:${label.toLowerCase()}`]
    });
  }

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
          },
          {
            type: 'separator'
          },
          ...tabJump
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
