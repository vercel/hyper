const {dialog} = require('electron').remote
const { spawnSync } = require('child_process');

const showDialog = () => {
 return dialog.showMessageBox({
  'type': 'warning',
  'title': 'Confirm',
  'buttons': ['Close', 'Cancel'],
  'message': 'Close this window?',
  'detail': 'There is still a process running in this terminal, closing it will kill it.',
}
);

}

export default function confirmClose(pid) {
	console.log("PID " + pid);
  let cmd = 'pgrep';
  let args = ['-P', pid];

  let pregp = spawnSync(cmd, args);

  console.log(pregp);
  console.log('EXIT: ' + pregp.status);
  if(pregp.status != 0)
    return;

  console.log('CHILD ' + pregp.stdout);
  return showDialog();
}

