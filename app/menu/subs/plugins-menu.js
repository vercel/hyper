module.exports = function (commands, updatePlugins) {
  return {
    label: 'Plugins',
    submenu: [
      {
        label: 'Update',
        accelerator: commands['plugins:update'],
        click() {
          updatePlugins();
        }
      }
    ]
  };
};
