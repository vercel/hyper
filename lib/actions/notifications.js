import {NOTIFICATION_DISMISS} from '../constants/notifications';

export function dismissNotification(id) {
  return {
    type: NOTIFICATION_DISMISS,
    id
  };
}
