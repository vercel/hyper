/* global Notification */
/* eslint no-new:0 */
export default function notify (title, body) {
  new Notification(title, { body });
}
