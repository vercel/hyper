/* global Notification */
/* eslint no-new:0 */
export default function notify(title, body, details = {}) {
  //eslint-disable-next-line no-console
  console.log(`[Notification] ${title}: ${body}`);
  if (details.error) {
    //eslint-disable-next-line no-console
    console.error(details.error);
  }
  new Notification(title, {body});
}
