import type {BrowserWindow, MenuItemConstructorOptions} from 'electron';

const shellMenu = (
  commandKeys: Record<string, string>,
  execCommand: (command: string, focusedWindow?: BrowserWindow) => void,
  profiles: string[]
): MenuItemConstructorOptions => {
  const isMac = process.platform === 'darwin';

  return {
    label: isMac ? 'Shell' : 'File',
    submenu: [
      {
        label: 'New Tab',
        accelerator: commandKeys['tab:new'],
        click(item, focusedWindow) {
          execCommand('tab:new', focusedWindow);
        }
      },
      {
        label: 'New Window',
        accelerator: commandKeys['window:new'],
        click(item, focusedWindow) {
          execCommand('window:new', focusedWindow);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Split Down',
        accelerator: commandKeys['pane:splitDown'],
        click(item, focusedWindow) {
          execCommand('pane:splitDown', focusedWindow);
        }
      },
      {
        label: 'Split Right',
        accelerator: commandKeys['pane:splitRight'],
        click(item, focusedWindow) {
          execCommand('pane:splitRight', focusedWindow);
        }
      },
      {
        type: 'separator'
      },
      ...profiles.map(
        (profile): MenuItemConstructorOptions => ({
          label: profile,
          submenu: [
            {
              label: 'New Tab',
              accelerator: commandKeys[`tab:new:${profile}`],
              click(item, focusedWindow) {
                execCommand(`tab:new:${profile}`, focusedWindow);
              }
            },
            {
              label: 'New Window',
              accelerator: commandKeys[`window:new:${profile}`],
              click(item, focusedWindow) {
                execCommand(`window:new:${profile}`, focusedWindow);
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Split Down',
              accelerator: commandKeys[`pane:splitDown:${profile}`],
              click(item, focusedWindow) {
                execCommand(`pane:splitDown:${profile}`, focusedWindow);
              }
            },
            {
              label: 'Split Right',
              accelerator: commandKeys[`pane:splitRight:${profile}`],
              click(item, focusedWindow) {
                execCommand(`pane:splitRight:${profile}`, focusedWindow);
              }
            }
          ]
        })
      ),
      {
        type: 'separator'
      },
      {
        label: 'Close',
        accelerator: commandKeys['pane:close'],
        click(item, focusedWindow) {
          execCommand('pane:close', focusedWindow);
        }
      },
      {
        label: isMac ? 'Close Window' : 'Quit',
        role: 'close',
        accelerator: commandKeys['window:close']
      }
    ]
  };
};

export default shellMenu;
