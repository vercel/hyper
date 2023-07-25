export const NOTIFICATION_MESSAGE = 'NOTIFICATION_MESSAGE';
export const NOTIFICATION_DISMISS = 'NOTIFICATION_DISMISS';

export interface NotificationMessageAction {
  type: typeof NOTIFICATION_MESSAGE;
  text: string;
  url: string | null;
  dismissable: boolean;
}
export interface NotificationDismissAction {
  type: typeof NOTIFICATION_DISMISS;
  id: string;
}

export type NotificationActions = NotificationMessageAction | NotificationDismissAction;
