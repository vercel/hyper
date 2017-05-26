const {accelerators} = require('../../accelerators');
const {openConfig} = require('../../config');

module.exports = function () {
  const submenu = [
    {
      role: 'undo',
      accelerator: accelerators.undo
    },
    {
      role: 'redo',
      accelerator: accelerators.redo
    },
    {
      type: 'separator'
    },
    {
      role: 'cut',
      accelerator: accelerators.cut
    },
    {
      role: 'copy',
      accelerator: accelerators.copy
    },
    {
      role: 'paste',
      accelerator: accelerators.paste
    },
    {
      role: 'selectall',
      accelerator: accelerators.selectAll
    },
    {
      type: 'separator'
    },
    {
      label: 'Clear Buffer',
      accelerator: accelerators.clear,
      click(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.rpc.emit('session clear req');
        }
      }
    }
  ];

  if (process.platform !== 'darwin') {
    submenu.push(
      {type: 'separator'},
      {
        label: 'Preferences...',
        accelerator: accelerators.preferences,
        click() {
          openConfig();
        }
      }
    );
  }

  return {
    label: 'Edit',
    submenu
  };
};
