import {BrowserWindow, MenuItemConstructorOptions} from 'electron';

export default (
  commands: Record<string, string>,
  execCommand: (command: string, focusedWindow?: BrowserWindow) => void
): MenuItemConstructorOptions => {
  return {
    label: 'Plugins',
    submenu: [
      {
        label: 'Update',
        accelerator: commands['plugins:update'],
        click() {
          execCommand('plugins:update');
        }
      },
      {
        label: 'Install Hyper CLI command in PATH',
        click() {
          execCommand('cli:install');
        }
      },
      {
        type: 'separator'
      }
    ]
  };
};
