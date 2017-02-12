module.exports = function (commands) {
  return {
    role: 'window',
    submenu: [
      {
        role: 'minimize',
        accelerator: commands['window:minimize']
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
            accelerator: commands['tab:prev'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('mv', {type: 'Tab', arrow: 'Prev'});
              }
            }
          },
          {
            label: 'Next',
            accelerator: commands['tab:next'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('mv', {type: 'Tab', arrow: 'Next'});
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
            label: 'Above',
            accelerator: commands['pane:up'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Up'});
              }
            }
          },
          {
            label: 'Bellow',
            accelerator: commands['pane:down'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Down'});
              }
            }
          },
          {
            label: 'Left',
            accelerator: commands['pane:left'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Left'});
              }
            }
          },
          {
            label: 'Right',
            accelerator: commands['pane:right'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Right'});
              }
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Previous',
            accelerator: commands['pane:prev'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Prev'});
              }
            }
          },
          {
            label: 'Next',
            accelerator: commands['pane:next'],
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Next'});
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
        accelerators: commands['window:full']
      }
    ]
  };
};
