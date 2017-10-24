module.exports = commands => {
  const submenu = [
    {
      role: 'undo',
      accelerator: commands['editor:undo']
    },
    {
      role: 'redo',
      accelerator: commands['editor:redo']
    },
    {
      type: 'separator'
    },
    {
      role: 'cut',
      accelerator: commands['editor:cut']
    },
    {
      role: 'copy',
      command: 'editor:copy',
      accelerator: commands['editor:copy']
    },
    {
      role: 'paste',
      accelerator: commands['editor:paste']
    },
    {
      role: 'selectall',
      accelerator: commands['editor:selectAll']
    },
    {
      type: 'separator'
    },
    {
      label: 'Clear Buffer',
      accelerator: commands['editor:clearBuffer']
    }
  ];

  if (process.platform !== 'darwin') {
    submenu.push(
      {type: 'separator'},
      {
        label: 'Preferences...',
        accelerator: commands['window:preferences']
      }
    );
  }

  return {
    label: 'Edit',
    submenu
  };
};
