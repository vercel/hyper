/* global Notification */
/* eslint no-new:0 */
export default function notify(title, body, error) {
  //eslint-disable-next-line no-console
  console.log(`[Notification] ${title}: ${body}`);
  if (error) {
    //eslint-disable-next-line no-console
    console.error(error);
  }
  new Notification(title, {body});
}
