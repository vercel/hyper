const {accelerators} = require('../../accelerators');

module.exports = function (update) {
  return {
    label: 'Plugins',
    submenu: [
      {
        label: 'Update',
        accelerator: accelerators.updatePlugins,
        click() {
          update();
        }
      }
    ]
  };
};
