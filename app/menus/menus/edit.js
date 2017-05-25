module.exports = function (commands) {
  return {
    label: 'Edit',
    submenu: [
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
    ]
  };
};
