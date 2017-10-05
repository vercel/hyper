module.exports = commands => {
  // Generating tab:jump array
  const tabJump = [];
  for (let i = 1; i <= 9; i++) {
    // 9 is a special number because it means 'last'
    const label = i === 9 ? 'Last' : `${i}`;
    const tabIndex = i === 9 ? 'last' : i - 1;
    tabJump.push({
      label: label,
      accelerator: commands[`tab:jump:${label.toLowerCase()}`],
      click(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.rpc.emit('move jump req', tabIndex);
        }
      }
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
            accelerator: commands['tab:prev'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('move left req');
              }
            }
          },
          {
            label: 'Next',
            accelerator: commands['tab:next'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('move right req');
              }
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
            accelerator: commands['pane:prev'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('prev pane req');
              }
            }
          },
          {
            label: 'Next',
            accelerator: commands['pane:next'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('next pane req');
              }
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
        accelerators: commands['window:toggleFullScreen']
      }
    ]
  };
};
