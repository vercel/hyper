module.exports = function (commands, update) {
  return {
    label: 'Plugins',
    submenu: [
      {
        label: 'Update',
        accelerator: commands['plugins:update'],
        click() {
          update();
        }
      }
    ]
  };
};
