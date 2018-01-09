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
      label: 'Move to...',
      submenu: [
        {
          label: 'Previous word',
          accelerator: commandKeys['editor:movePreviousWord'],
          click(item, focusedWindow) {
            execCommand('editor:movePreviousWord', focusedWindow);
          }
        },
        {
          label: 'Next word',
          accelerator: commandKeys['editor:moveNextWord'],
          click(item, focusedWindow) {
            execCommand('editor:moveNextWord', focusedWindow);
          }
        },
        {
          label: 'Line beginning',
          accelerator: commandKeys['editor:moveBeginningLine'],
          click(item, focusedWindow) {
            execCommand('editor:moveBeginningLine', focusedWindow);
          }
        },
        {
          label: 'Line end',
          accelerator: commandKeys['editor:moveEndLine'],
          click(item, focusedWindow) {
            execCommand('editor:moveEndLine', focusedWindow);
          }
        }
      ]
    },
    {
      label: 'Delete...',
      submenu: [
        {
          label: 'Previous word',
          accelerator: commandKeys['editor:deletePreviousWord'],
          click(item, focusedWindow) {
            execCommand('editor:deletePreviousWord', focusedWindow);
          }
        },
        {
          label: 'Next word',
          accelerator: commandKeys['editor:deleteNextWord'],
          click(item, focusedWindow) {
            execCommand('editor:deleteNextWord', focusedWindow);
          }
        },
        {
          label: 'Line beginning',
          accelerator: commandKeys['editor:deleteBeginningLine'],
          click(item, focusedWindow) {
            execCommand('editor:deleteBeginningLine', focusedWindow);
          }
        },
        {
          label: 'Line end',
          accelerator: commandKeys['editor:deleteEndLine'],
          click(item, focusedWindow) {
            execCommand('editor:deleteEndLine', focusedWindow);
          }
        }
      ]
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
