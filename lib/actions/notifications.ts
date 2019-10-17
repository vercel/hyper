import {NOTIFICATION_MESSAGE, NOTIFICATION_DISMISS} from '../constants/notifications';

export function dismissNotification(id: string) {
  return {
    type: NOTIFICATION_DISMISS,
    id
  };
}

export function addNotificationMessage(text: string, url: string | null = null, dismissable = true) {
  return {
    type: NOTIFICATION_MESSAGE,
    text,
    url,
    dismissable
  };
}
