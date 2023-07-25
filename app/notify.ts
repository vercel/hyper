import {app, Notification} from 'electron';

import {icon} from './config/paths';

export default function notify(title: string, body = '', details: {error?: any} = {}) {
  console.log(`[Notification] ${title}: ${body}`);
  if (details.error) {
    console.error(details.error);
  }
  if (app.isReady()) {
    _createNotification(title, body);
  } else {
    app.on('ready', () => {
      _createNotification(title, body);
    });
  }
}

const _createNotification = (title: string, body: string) => {
  new Notification({title, body, ...(process.platform === 'linux' && {icon})}).show();
};
