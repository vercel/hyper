//   // This menu label is overrided by OSX to be the appName
//   // The label is set to appName here so it matches actual behavior

// {
//   "hyper": {
//     "cmd+shift+]": "tab:next",
//     "cmd+shift+[": "tab:prev",
//     "cmd+]": "pane:next",
//     "cmd+[": "pane:prev",
//     "cmd+alt+left": "pane:left",
//     "cmd+alt+right": "pane:right",
//     "cmd+alt+up": "pane:up",
//     "cmd+alt+down": "pane:down"
//   }
// }
module.exports = {
  label: 'Hyper',
  submenu: [
    {
      role: 'about'
    },
    {
      type: 'separator'
    },
    // {
    //   label: 'Preferences...',
    //   accelerator: accelerators.preferences,
    //   // click(item, focusedWindow) {
    //   //   if (focusedWindow) {
    //   //     focusedWindow.rpc.emit('preferences');
    //   //   } else {
    //   //     createWindow(win => win.rpc.emit('preferences'));
    //   //   }
    //   // }
    // },
    {
      type: 'separator'
    },
    {
      role: 'services',
      submenu: []
    },
    {
      type: 'separator'
    },
    {
      role: 'hide'
    },
    {
      role: 'hideothers'
    },
    {
      role: 'unhide'
    },
    {
      type: 'separator'
    },
    {
      role: 'quit'
    }
  ]
};
