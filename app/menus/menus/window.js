module.exports = function (commands) {
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
      { // It's the same thing as clicking the green traffc-light on macOS
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
