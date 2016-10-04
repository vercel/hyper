const os = require('os');
const path = require('path');
const {app, shell, dialog} = require('electron');

const appName = app.getName();

// based on and inspired by
// https://github.com/sindresorhus/anatine/blob/master/menu.js

module.exports = function createMenu({createWindow, updatePlugins}) {
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
        accelerator: 'Cmd+,',
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
    label: process.platform === 'darwin' ? 'Shell' : 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: 'CmdOrCtrl+N',
        click() {
          createWindow();
        }
      },
      {
        label: 'New Tab',
        accelerator: 'CmdOrCtrl+T',
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
        accelerator: 'Ctrl+Shift+E',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('split request vertical');
          }
        }
      },
      {
        label: 'Split Horizontally',
        accelerator: 'Ctrl+Shift+O',
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
        accelerator: 'CmdOrCtrl+W',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('termgroup close req');
          }
        }
      },
      {
        label: process.platform === 'darwin' ? 'Close Terminal Window' : 'Quit',
        role: 'close',
        accelerator: 'CmdOrCtrl+Shift+W'
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
        accelerator: 'CmdOrCtrl+K',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('session clear req');
          }
        }
      }
    ]
  };

  if (process.platform !== 'darwin') {
    editMenu.submenu.push(
      {type: 'separator'},
      {
        label: 'Preferences...',
        accelerator: 'Cmd+,',
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
        accelerator: 'CmdOrCtrl+R',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('reload');
          }
        }
      },
      {
        label: 'Full Reload',
        accelerator: 'CmdOrCtrl+Shift+R',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
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
        accelerator: 'CmdOrCtrl+0',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('reset fontSize req');
          }
        }
      },
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+plus',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('increase fontSize req');
          }
        }
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('decrease fontSize req');
          }
        }
      }
    ]
  };

  const pluginsMenu = {
    label: 'Plugins',
    submenu: [
      {
        label: 'Update All Now',
        accelerator: 'CmdOrCtrl+Shift+U',
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
        accelerator: 'CmdOrCtrl+Option+Left',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('move left req');
          }
        }
      },
      {
        label: 'Show Next Tab',
        accelerator: 'CmdOrCtrl+Option+Right',
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
        label: 'Select Next Pane',
        accelerator: 'Ctrl+Alt+Tab',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('next pane req');
          }
        }
      },
      {
        label: 'Select Previous Pane',
        accelerator: 'Ctrl+Shift+Alt+Tab',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.rpc.emit('prev pane req');
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
          shell.openExternal('https://hyperterm.now.sh');
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

          shell.openExternal(`https://github.com/zeit/hyperterm/issues/new?body=${encodeURIComponent(body)}`);
        }
      }
    ]
  };

  if (process.platform !== 'darwin') {
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
    process.platform === 'darwin' ? osxApplicationMenu : [],
    shellOrFileMenu,
    editMenu,
    viewMenu,
    pluginsMenu,
    windowMenu,
    helpMenu
  );

  return menu;
};
