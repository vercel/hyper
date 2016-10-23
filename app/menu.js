const os = require('os');
const path = require('path');
const {app, shell, dialog} = require('electron');

const isMac = process.platform === 'darwin';
const appName = app.getName();

// based on and inspired by
// https://github.com/sindresorhus/anatine/blob/master/menu.js

module.exports = ({createWindow, updatePlugins}) => {
  const osxApplicationMenu = {
    // This menu label is overrided by OSX to be the appName
    // The label is set to appName here so it matches actual behavior
    label: appName,
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Preferences...',
        command: 'show-settings',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('preferences');
          } else {
            createWindow(win => win.rpc.emit('preferences'));
          }
        }
      },
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

  const shellOrFileMenu = {
    label: isMac ? 'Shell' : 'File',
    submenu: [
      {
        label: 'New Window',
        command: 'new-window',
        click() {
          createWindow();
        }
      },
      {
        label: 'New Tab',
        command: 'new-tab',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('termgroup add req');
          } else {
            createWindow();
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Split Vertically',
        command: 'split-vertical',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('split request vertical');
          }
        }
      },
      {
        label: 'Split Horizontally',
        command: 'split-horizontal',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('split request horizontal');
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Close',
        command: 'close',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('termgroup close req');
          }
        }
      },
      {
        label: isMac ? 'Close Terminal Window' : 'Quit',
        command: 'close-window',
        role: 'close'
      }
    ]
  };

  const editMenu = {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'selectall'
      },
      {
        type: 'separator'
      },
      {
        label: 'Clear',
        command: 'clear',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('session clear req');
          }
        }
      }
      /**
      ,{
        type: 'separator'
      },
       * @TODO: implemented in rpc, ./lib/index.js
      ...[{
        label: 'Move word Left',
        command: 'move-word-left',
      }, {
        label: 'Move word Right',
        command: 'move-word-right',
      }, {
        label: 'Delete word Left',
        command: 'delete-word-left',
      }, {
        label: 'Delete word Right',
        command: 'delete-word-right',
      }, {
        label: 'Delete line',
        command: 'delete-line',
      }, {
        label: 'Move to line start',
        command: 'move-to-line-start',
      }, {
        label: 'Move to line end',
        command: 'move-to-line-end',
      }, {
        label: 'Select All',
        command: 'select-all',
      }].map(submenuItem => {
        item.click = function click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit(submenuItem.command);
          }
        };
        return item;
      }),
      */
    ]
  };

  if (!isMac) {
    editMenu.submenu.push(
      {type: 'separator'},
      {
        label: 'Preferences...',
        command: 'show-settings',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('preferences');
          } else {
            createWindow(win => win.rpc.emit('preferences'));
          }
        }
      }
    );
  }

  const viewMenu = {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        command: 'reload',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('reload');
          }
        }
      },
      {
        label: 'Full Reload',
        command: 'reload-full',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      },
      {
        label: 'Toggle Developer Tools',
        command: 'toggle-devtools',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.toggleDevTools();
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Reset Zoom Level',
        command: 'zoom-reset',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('reset fontSize req');
          }
        }
      },
      {
        label: 'Zoom In',
        command: 'zoom-in',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('increase fontSize req');
          }
        }
      },
      {
        label: 'Zoom Out',
        command: 'zoom-out',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('decrease fontSize req');
          }
        }
      }
      /**
      * @TODO: implemented in rpc, ./lib/index.js
      ,{
        type: 'separator'
      },
      ...[ 1, 2, 3, 4, 5, 6, 7, 8, 'last' ].map((value, index) => ({
        label: `Show ${value} Tab`,
        command: `tab-show-${ value === 'last' ? value : index }`,
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit(`move req ${ value === 'last' ? value : index }`);
          }
        }
      })),
      */
    ]
  };

  const pluginsMenu = {
    label: 'Plugins',
    submenu: [
      {
        label: 'Update All Now',
        command: 'update-plugins',
        click() {
          updatePlugins();
        }
      }
    ]
  };

  const windowMenu = {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'zoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Show Previous Tab',
        command: 'prev-tab',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('move left req');
          }
        }
      },
      {
        label: 'Show Next Tab',
        command: 'next-tab',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('move right req');
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Select Previous Pane',
        command: 'prev-pane',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('prev pane req');
          }
        }
      },
      {
        label: 'Select Next Pane',
        command: 'next-pane',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('next pane req');
          }
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'front'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  };

  const helpMenu = {
    role: 'help',
    submenu: [
      {
        label: `${appName} Website`,
        click() {
          shell.openExternal('https://hyper.is');
        }
      },
      {
        label: 'Report an Issue...',
        click() {
          const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->

-

${app.getName()} ${app.getVersion()}
Electron ${process.versions.electron}
${process.platform} ${process.arch} ${os.release()}`;

          shell.openExternal(`https://github.com/zeit/hyper/issues/new?body=${encodeURIComponent(body)}`);
        }
      }
    ]
  };

  if (!isMac) {
    helpMenu.submenu.push(
      {type: 'separator'},
      {
        role: 'about',
        click() {
          dialog.showMessageBox({
            title: `About ${appName}`,
            message: `${appName} ${app.getVersion()}`,
            detail: 'Created by Guillermo Rauch',
            icon: path.join(__dirname, 'static/icon.png'),
            buttons: []
          });
        }
      }
    );
  }

  const menu = [].concat(
    isMac ? osxApplicationMenu : [],
    shellOrFileMenu,
    editMenu,
    viewMenu,
    pluginsMenu,
    windowMenu,
    helpMenu
  );

  return menu;
};
