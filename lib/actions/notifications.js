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
