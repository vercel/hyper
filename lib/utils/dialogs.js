const {dialog} = require('electron').remote

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

export default function confirmClose() {
	return showDialog();
}

