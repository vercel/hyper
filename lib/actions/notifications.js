import ms from 'ms';
import {satisfies} from 'semver';
import {version} from '../../package';
import {
  NOTIFICATION_MESSAGE,
  NOTIFICATION_DISMISS
} from '../constants/notifications';

export function dismissNotification(id) {
  return {
    type: NOTIFICATION_DISMISS,
    id
  };
}

export function addNotificationMessage(text, url = null, dismissable = true) {
  return {
    type: NOTIFICATION_MESSAGE,
    text,
    url,
    dismissable
  };
}

export function fetchNotifications() {
  return dispatch => {
    const retry = err => {
      setTimeout(() => dispatch(fetchNotifications()), ms(err ? '10s' : '5m'));
      if (err) {
        console.error('Notification messages fetch error', err.stack);
      }
    };

    console.log('Checking for notification messages');
    fetch('https://hyper-news.now.sh')
    .then(res => res.json())
    .then(data => {
      const {messages} = data || {};
      if (!messages) {
        throw new Error('Bad response');
      }
      const message = messages.find(msg => {
        return matchVersion(msg.versions);
      });
      if (message) {
        dispatch(addNotificationMessage(
          message.text,
          message.url,
          message.dismissable
        ));
      } else {
        console.log('No matching notification messages');
      }
      retry();
    })
    .catch(retry);
  };
}

function matchVersion(versions) {
  return versions.some(v => {
    return v === '*' || satisfies(version, v);
  });
}
