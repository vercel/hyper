/* global Notification */
/* eslint no-new:0 */
export default function notify(title, body) {
  console.log(`[Notification] ${title}: ${body}`);
  new Notification(title, {body});
}
