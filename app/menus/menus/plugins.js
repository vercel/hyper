export default (commands, execCommand) => {
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
