module.exports = function (commands) {
  return {
    label: 'Plugins',
    submenu: [
      {
        label: 'Update All Now',
        // accelerator: accelerators.updatePlugins,
        click() {
          // updatePlugins();
        }
      }
    ]
  };
}
