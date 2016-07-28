import * as regex from './url-regex';

export const domainRegex = /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b|^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*:)*?:?0*1$/;

export default function isUrlCommand (shell, data) {
  const matcher = regex[shell];
  if (undefined === matcher || !data) return null;

  const match = data.match(matcher);
  if (!match) return null;
  const protocol = match[1];
  const path = match[2];

  if (path) {
    if (protocol) {
      return `${protocol}${path}`;
    }
    // extract the domain portion from the url
    const domain = path.split('/')[0];
    if (domainRegex.test(domain)) {
      return `http://${path}`;
    }
  }

  return null;
}
