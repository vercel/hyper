module.exports = function (commands, shell, configFile) {
  const submenu = [
    {
      role: 'undo',
      accelerator: commands.undo
    },
    {
      role: 'redo',
      accelerator: commands.redo
    },
    {
      type: 'separator'
    },
    {
      role: 'cut',
      accelerator: commands.cut
    },
    {
      role: 'copy',
      accelerator: commands.copy
    },
    {
      role: 'paste',
      accelerator: commands.paste
    },
    {
      role: 'selectall',
      accelerator: commands.selectAll
    },
    {
      type: 'separator'
    },
    {
      label: 'Clear Buffer',
      accelerator: commands.clear,
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
        accelerator: commands.preferences,
        click() {
          shell.openItem(configFile);
        }
      }
    );
  }

  return {
    label: 'Edit',
    submenu
  };
};
