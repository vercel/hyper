import {Notification} from 'electron';
import {icon} from './config/paths';

export default function notify(title: string, body = '', details: any = {}) {
  console.log(`[Notification] ${title}: ${body}`);
  if (details.error) {
    console.error(details.error);
  }
  new Notification({title, body, ...(process.platform === 'linux' && {icon})}).show();
}
