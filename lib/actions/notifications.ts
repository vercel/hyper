import {NOTIFICATION_MESSAGE, NOTIFICATION_DISMISS} from '../../typings/constants/notifications';
import type {HyperActions} from '../../typings/hyper';

export function dismissNotification(id: string): HyperActions {
  return {
    type: NOTIFICATION_DISMISS,
    id
  };
}

export function addNotificationMessage(text: string, url: string | null = null, dismissable = true): HyperActions {
  return {
    type: NOTIFICATION_MESSAGE,
    text,
    url,
    dismissable
  };
}
