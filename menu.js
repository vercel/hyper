const os = require('os');
const path = require('path');
const { app, shell, dialog } = require('electron');
const appName = app.getName();

// based on and inspired by
// https://github.com/sindresorhus/anatine/blob/master/menu.js


module.exports = function createMenu ({ createWindow }) {
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
              focusedWindow.rpc.emit('new tab');
            } else {
              createWindow();
            }
          }
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('close tab');
            }
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
        { type: 'separator' },
        {
          label: 'Clear',
          accelerator: 'CmdOrCtrl+K',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('clear');
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
            if (focusedWindow) focusedWindow.reload();
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
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('reset font size');
            }
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+plus',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('increase font size');
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('decrease font size');
            }
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          role: 'minimize'
        },
        {
          role: 'close'
        },
        {
          type: 'separator'
        },
        {
          label: 'Show Previous Tab',
          accelerator: 'CmdOrCtrl+Left',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('move left');
            }
          }
        },
        {
          label: 'Show Next Tab',
          accelerator: 'CmdOrCtrl+Right',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('move right');
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
                    detail: 'Created by Sindre Sorhus',
                    icon: path.join(__dirname, 'static/Icon.png'),
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
