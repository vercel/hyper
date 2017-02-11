const os = require('os');
const path = require('path');
const {app, shell, dialog} = require('electron');

const {accelerators} = require('../accelerators');

const isMac = process.platform === 'darwin';


module.exports = class Menu  {
  constructor(commands) {
    this.commands = commands;
    this.windowMenu = require('./template/window')(commands);
    this.viewMenu = require('./template/view')(commands);
  }
  
  template() {
    const darwin = require('./template/darwin');
    return [].concat(darwin, this.viewMenu, this.windowMenu);
  }
}
// based on and inspired by
// https://github.com/sindresorhus/anatine/blob/master/menu.js


// module.exports = ({createWindow, updatePlugins}) => {
//   const osxApplicationMenu = {
//     // This menu label is overrided by OSX to be the appName
//     // The label is set to appName here so it matches actual behavior
//     label: appName,
//     submenu: [
//       {
//         role: 'about'
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Preferences...',
//         accelerator: accelerators.preferences,
//         click(item, focusedWindow) {
//           if (focusedWindow) {
//             focusedWindow.rpc.emit('preferences');
//           } else {
//             createWindow(win => win.rpc.emit('preferences'));
//           }
//         }
//       },
//       {
//         type: 'separator'
//       },
//       {
//         role: 'services',
//         submenu: []
//       },
//       {
//         type: 'separator'
//       },
//       {
//         role: 'hide'
//       },
//       {
//         role: 'hideothers'
//       },
//       {
//         role: 'unhide'
//       },
//       {
//         type: 'separator'
//       },
//       {
//         role: 'quit'
//       }
//     ]
//   };
// 
//   const shellOrFileMenu = {
//     label: isMac ? 'Shell' : 'File',
//     submenu: [
//       {
//         label: 'New Window',
//         accelerator: accelerators.newWindow,
//         click() {
//           createWindow();
//         }
//       },
//       {
//         label: 'New Tab',
//         accelerator: accelerators.newTab,
//         click(item, focusedWindow) {
//           if (focusedWindow) {
//             focusedWindow.rpc.emit('termgroup add req');
//           } else {
//             createWindow();
//           }
//         }
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Split Vertically',
//         accelerator: accelerators.splitVertically,
//         click(item, focusedWindow) {
//           if (focusedWindow) {
//             focusedWindow.rpc.emit('split request vertical');
//           }
//         }
//       },
//       {
//         label: 'Split Horizontally',
//         accelerator: accelerators.splitHorizontally,
//         click(item, focusedWindow) {
//           if (focusedWindow) {
//             focusedWindow.rpc.emit('split request horizontal');
//           }
//         }
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Close Session',
//         accelerator: accelerators.closeSession,
//         click(item, focusedWindow) {
//           if (focusedWindow) {
//             focusedWindow.rpc.emit('termgroup close req');
//           }
//         }
//       },
//       {
//         label: isMac ? 'Close Window' : 'Quit',
//         role: 'close',
//         accelerator: accelerators.closeWindow
//       }
//     ]
//   };
// 
//   const editMenu = {
//     label: 'Edit',
//     submenu: [
//       {
//         role: 'undo',
//         accelerator: accelerators.undo
//       },
//       {
//         role: 'redo',
//         accelerator: accelerators.redo
//       },
//       {
//         type: 'separator'
//       },
//       {
//         role: 'cut',
//         accelerator: accelerators.cut
//       },
//       {
//         role: 'copy',
//         accelerator: accelerators.copy
//       },
//       {
//         role: 'paste',
//         accelerator: accelerators.paste
//       },
//       {
//         role: 'selectall',
//         accelerator: accelerators.selectAll
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Clear',
//         accelerator: accelerators.clear,
//         click(item, focusedWindow) {
//           if (focusedWindow) {
//             focusedWindow.rpc.emit('session clear req');
//           }
//         }
//       }
//     ]
//   };
// 
//   if (!isMac) {
//     editMenu.submenu.push(
//       {type: 'separator'},
//       {
//         label: 'Preferences...',
//         accelerator: accelerators.preferences,
//         click(item, focusedWindow) {
//           if (focusedWindow) {
//             focusedWindow.rpc.emit('preferences');
//           } else {
//             createWindow(win => win.rpc.emit('preferences'));
//           }
//         }
//       }
//     );
//   }
// 
// 
//   const pluginsMenu = {
//     label: 'Plugins',
//     submenu: [
//       {
//         label: 'Update All Now',
//         accelerator: accelerators.updatePlugins,
//         click() {
//           updatePlugins();
//         }
//       }
//     ]
//   };
// 
//   const windowMenu = {
//     role: 'window',
//     submenu: [
//       {
//         role: 'minimize',
//         accelerator: accelerators.minimize
//       },
//       {
//         role: 'zoom'
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Select Tab',
//         submenu: [
//           {
//             label: 'Previous',
//             accelerator: accelerators.prevTab,
//             click(item, focusedWindow) {
//               if (focusedWindow) {
//                 focusedWindow.rpc.emit('mv', {type: 'Tab', arrow: 'Prev'});
//               }
//             }
//           },
//           {
//             label: 'Next',
//             accelerator: accelerators.nextTab,
//             click(item, focusedWindow) {
//               if (focusedWindow) {
//                 focusedWindow.rpc.emit('mv', {type: 'Tab', arrow: 'Next'});
//               }
//             }
//           }
//         ]
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Select Pane',
//         submenu: [
//           {
//             label: 'Above',
//             accelerator: accelerators.topPane,
//             click(item, focusedWindow) {
//               if (focusedWindow) {
//                 focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Up'});
//               }
//             }
//           },
//           {
//             label: 'Bellow',
//             accelerator: accelerators.bottomPane,
//             click(item, focusedWindow) {
//               if (focusedWindow) {
//                 focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Down'});
//               }
//             }
//           },
//           {
//             label: 'Left',
//             accelerator: accelerators.leftPane,
//             click(item, focusedWindow) {
//               if (focusedWindow) {
//                 focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Left'});
//               }
//             }
//           },
//           {
//             label: 'Right',
//             accelerator: accelerators.rightPane,
//             click(item, focusedWindow) {
//               if (focusedWindow) {
//                 focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Right'});
//               }
//             }
//           },
//           {
//             type: 'separator'
//           },
//           {
//             label: 'Previous',
//             accelerator: accelerators.prevPane,
//             click(item, focusedWindow) {
//               if (focusedWindow) {
//                 focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Prev'});
//               }
//             }
//           },
//           {
//             label: 'Next',
//             accelerator: accelerators.nextPane,
//             click(item, focusedWindow) {
//               if (focusedWindow) {
//                 focusedWindow.rpc.emit('mv', {type: 'Pane', arrow: 'Next'});
//               }
//             }
//           }
//         ]
//       },
//       {
//         type: 'separator'
//       },
//       {
//         role: 'front'
//       },
//       {
//         role: 'togglefullscreen'
//       }
//     ]
//   };
// 
//   const helpMenu = {
//     role: 'help',
//     submenu: [
//       {
//         label: `${appName} Website`,
//         click() {
//           shell.openExternal('https://hyper.is');
//         }
//       },
//       {
//         label: 'Report an Issue...',
//         click() {
//           const body = `
// <!-- Please succinctly describe your issue and steps to reproduce it. -->
// 
// -
// 
// ${app.getName()} ${app.getVersion()}
// Electron ${process.versions.electron}
// ${process.platform} ${process.arch} ${os.release()}`;
// 
//           shell.openExternal(`https://github.com/zeit/hyper/issues/new?body=${encodeURIComponent(body)}`);
//         }
//       }
//     ]
//   };
// 
//   if (!isMac) {
//     helpMenu.submenu.push(
//       {type: 'separator'},
//       {
//         role: 'about',
//         click() {
//           dialog.showMessageBox({
//             title: `About ${appName}`,
//             message: `${appName} ${app.getVersion()}`,
//             detail: 'Created by Guillermo Rauch',
//             icon: path.join(__dirname, 'static/icon.png'),
//             buttons: []
//           });
//         }
//       }
//     );
//   }
// 
//   const menu = [].concat(
//     isMac ? osxApplicationMenu : [],
//     shellOrFileMenu,
//     editMenu,
//     viewMenu,
//     pluginsMenu,
//     windowMenu,
//     helpMenu
//   );
// 
//   return menu;
// };
