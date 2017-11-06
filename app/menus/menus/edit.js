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
