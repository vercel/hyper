const ms = require('ms');
const fetch = require('node-fetch');
const {satisfies} = require('semver');

const {version} = './package';

const NEWS_URL = 'https://hyper-news.now.sh';
const matchVersion = versions => (
  versions.some(v => v === '*' || satisfies(version, v))
);

module.exports = function fetchNotifications(win) {
  const {rpc} = win;
  const retry = err => {
    setTimeout(() => fetchNotifications(win), ms('30m'));
    if (err) {
      console.error('Notification messages fetch error', err.stack);
    }
  };

  console.log('Checking for notification messages');
  fetch(NEWS_URL)
  .then(res => res.json())
  .then(data => {
    const {messages} = data || {};
    if (!messages) {
      throw new Error('Bad response');
    }
    const message = messages.find(msg => matchVersion(msg.versions));
    if (message) {
      rpc.emit('add notification', message);
    } else {
      console.log('No matching notification messages');
    }

    retry();
  })
  .catch(retry);
};
