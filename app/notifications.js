const ms = require('ms');
const fetch = require('electron-fetch');

const {version} = require('./package');

const NEWS_URL = 'https://hyper-news.now.sh';

module.exports = function fetchNotifications(win) {
  const {rpc} = win;
  const retry = err => {
    setTimeout(() => fetchNotifications(win), ms('30m'));
    if (err) {
      //eslint-disable-next-line no-console
      console.error('Notification messages fetch error', err.stack);
    }
  };
  //eslint-disable-next-line no-console
  console.log('Checking for notification messages');
  fetch(NEWS_URL, {
    headers: {
      'X-Hyper-Version': version,
      'X-Hyper-Platform': process.platform
    }
  })
    .then(res => res.json())
    .then(data => {
      const {message} = data || {};
      if (typeof message !== 'object' && message !== '') {
        throw new Error('Bad response');
      }
      if (message === '') {
        //eslint-disable-next-line no-console
        console.log('No matching notification messages');
      } else {
        rpc.emit('add notification', message);
      }

      retry();
    })
    .catch(retry);
};
