module.exports = (commandKeys, execCommand) => {
  const submenu = [
    {
      role: 'undo',
      accelerator: commandKeys['editor:undo']
    },
    {
      role: 'redo',
      accelerator: commandKeys['editor:redo']
    },
    {
      type: 'separator'
    },
    {
      role: 'cut',
      accelerator: commandKeys['editor:cut']
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
        accelerator: commandKeys['window:preferences']
      }
    );
  }

  return {
    label: 'Edit',
    submenu
  };
};
