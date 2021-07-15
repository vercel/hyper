import ms from 'ms';
import fetch from 'electron-fetch';
import {version} from './package.json';
import {BrowserWindow} from 'electron';

const NEWS_URL = 'https://hyper-news.now.sh';

export default function fetchNotifications(win: BrowserWindow) {
  const {rpc} = win;
  const retry = (err?: Error) => {
    setTimeout(() => fetchNotifications(win), ms('30m'));
    if (err) {
      console.error('Notification messages fetch error', err.stack);
    }
  };
  console.log('Checking for notification messages');
  fetch(NEWS_URL, {
    headers: {
      'X-Hyper-Version': version,
      'X-Hyper-Platform': process.platform
    }
  })
    .then((res) => res.json())
    .then((data) => {
      const {message} = data || {};
      if (typeof message !== 'object' && message !== '') {
        throw new Error('Bad response');
      }
      if (message === '') {
        console.log('No matching notification messages');
      } else {
        rpc.emit('add notification', message);
      }

      retry();
    })
    .catch(retry);
}
