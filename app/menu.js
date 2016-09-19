const os = require('os');
const path = require('path');
const { app, shell, dialog } = require('electron');
const appName = app.getName();

// based on and inspired by
// https://github.com/sindresorhus/anatine/blob/master/menu.js

module.exports = function createMenu ({ createWindow, updatePlugins }) {
  return [
    {
      label: 'Application',
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
          click (item, focusedWindow) {
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
    },
    {
      label: 'Shell',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click (item, focusedWindow) {
            createWindow();
          }
        },
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('session add req');
            } else {
              createWindow();
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('session close req');
            }
          }
        },
        {
          label: 'Close Terminal Window',
          role: 'close',
          accelerator: 'CmdOrCtrl+Shift+W'
        }
      ]
    },
    {
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
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('session clear req');
            }
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('reload');
            }
          }
        },
        {
          label: 'Full Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.reload();
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click (item, focusedWindow) {
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
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('reset fontSize req');
            }
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+plus',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('increase fontSize req');
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('decrease fontSize req');
            }
          }
        }
      ]
    },
    {
      label: 'Plugins',
      submenu: [
        {
          label: 'Update All Now',
          accelerator: 'CmdOrCtrl+Shift+U',
          click () {
            updatePlugins();
          }
        }
      ]
    },
    {
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
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('move left req');
            }
          }
        },
        {
          label: 'Show Next Tab',
          accelerator: 'CmdOrCtrl+Option+Right',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('move right req');
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
    },
    {
      role: 'help',
      submenu: [
        {
          label: `${appName} Website`,
          click () {
            shell.openExternal('https://hyperterm.now.sh');
          }
        },
        {
          label: 'Report an Issue...',
          click () {
            const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->

-

${app.getName()} ${app.getVersion()}
Electron ${process.versions.electron}
${process.platform} ${process.arch} ${os.release()}`;

            shell.openExternal(`https://github.com/zeit/hyperterm/issues/new?body=${encodeURIComponent(body)}`);
          }
        },
        ...(
          'darwin' !== process.platform
            ? [
                { type: 'separator' },
              {
                role: 'about',
                click () {
                  dialog.showMessageBox({
                    title: `About ${appName}`,
                    message: `${appName} ${app.getVersion()}`,
                    detail: 'Created by Guillermo Rauch',
                    icon: path.join(__dirname, 'static/icon.png'),
                    buttons: []
                  });
                }
              }
            ]
            : []
        )
      ]
    }
  ];
};
