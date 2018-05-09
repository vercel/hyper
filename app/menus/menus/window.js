module.exports = (commandKeys, execCommand) => {
  // Generating tab:jump array
  const tabJump = [];
  for (let i = 1; i <= 9; i++) {
    // 9 is a special number because it means 'last'
    const label = i === 9 ? 'Last' : `${i}`;
    tabJump.push({
      label: label,
      accelerator: commandKeys[`tab:jump:${label.toLowerCase()}`]
    });
  }

  return {
    role: 'window',
    submenu: [
      {
        role: 'minimize',
        accelerator: commandKeys['window:minimize']
      },
      {
        type: 'separator'
      },
      {
        // It's the same thing as clicking the green traffc-light on macOS
        role: 'zoom',
        accelerator: commandKeys['window:zoom']
      },
      {
        label: 'Select Tab',
        submenu: [
          {
            label: 'Previous',
            accelerator: commandKeys['tab:prev'],
            click: (item, focusedWindow) => {
              execCommand('tab:prev', focusedWindow);
            }
          },
          {
            label: 'Next',
            accelerator: commandKeys['tab:next'],
            click: (item, focusedWindow) => {
              execCommand('tab:next', focusedWindow);
            }
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
            accelerator: commandKeys['pane:prev'],
            click: (item, focusedWindow) => {
              execCommand('pane:prev', focusedWindow);
            }
          },
          {
            label: 'Next',
            accelerator: commandKeys['pane:next'],
            click: (item, focusedWindow) => {
              execCommand('pane:next', focusedWindow);
            }
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
        accelerator: commandKeys['window:toggleFullScreen']
      }
    ]
  };
};
