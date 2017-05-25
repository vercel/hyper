module.exports = function (commands) {
  return {
    role: 'window',
    submenu: [
      {
        role: 'minimize',
        accelerator: commands.minimize
      },
      {
        role: 'zoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Select Tab',
        submenu: [
          {
            label: 'Previous',
            accelerator: commands.showPreviousTab,
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('move left req');
              }
            }
          },
          {
            label: 'Next',
            accelerator: commands.showNextTab,
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
            accelerator: commands.selectNextPane,
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('prev pane req');
              }
            }
          },
          {
            label: 'Next',
            accelerator: commands.selectPreviousPane,
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
        accelerators: commands.enterFullScreen
      }
    ]
  };
};
