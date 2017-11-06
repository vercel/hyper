module.exports = (commandKeys, execCommand) => {
  const submenu = [
    {
      label: 'Undo',
      accelerator: commandKeys['editor:undo'],
      enabled: false
    },
    {
      label: 'Redo',
      accelerator: commandKeys['editor:redo'],
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: 'Cut',
      accelerator: commandKeys['editor:cut'],
      enabled: false
    },
    {
      role: 'copy',
      command: 'editor:copy',
      accelerator: commandKeys['editor:copy']
    },
    {
      role: 'paste',
      accelerator: commandKeys['editor:paste']
    },
    {
      role: 'selectall',
      accelerator: commandKeys['editor:selectAll']
    },
    {
      type: 'separator'
    },
    {
      label: 'Clear Buffer',
      accelerator: commandKeys['editor:clearBuffer'],
      click(item, focusedWindow) {
        execCommand('editor:clearBuffer', focusedWindow);
      }
    }
  ];

  if (process.platform !== 'darwin') {
    submenu.push(
      {type: 'separator'},
      {
        label: 'Preferences...',
        accelerator: commandKeys['window:preferences'],
        click() {
          execCommand('window:preferences');
        }
      }
    );
  }

  return {
    label: 'Edit',
    submenu
  };
};
