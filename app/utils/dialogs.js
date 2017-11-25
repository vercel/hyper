const {dialog} = require('electron');
const {spawnSync} = require('child_process');

const showDialog = () => {
  return dialog.showMessageBox({
    type: 'warning',
    title: 'Confirm',
    buttons: ['Close', 'Cancel'],
    message: 'Close the app?',
    detail: 'There is still a process running in this terminal, closing it will kill it.'
  });
};

exports.confirmClose = pid => {
  let cmd = 'pgrep';
  let args = ['-P', pid];

  let pregp = spawnSync(cmd, args);

  if (pregp.status != 0) return;

  return showDialog();
};
