import * as regex from './url-regex';

export const domainRegex = /([0-9]+[:.]*)+|([a-zA-Z0-9.]+[.][a-zA-Z0-9.]+([:][0-9]+)*){1}/;

export default function isUrlCommand(shell, data) {
  const matcher = regex[shell]; // eslint-disable-line import/namespace
  if (undefined === matcher || !data) {
    return null;
  }

  const match = data.match(matcher);
  if (!match) {
    return null;
  }
  const protocol = match[1];
  const path = match[2];

  if (path) {
    if (protocol) {
      return `${protocol}${path}`;
    }
    // extract the domain portion from the url
    const domain = path.split('/')[0];
    if (domainRegex.test(domain)) {
      const result = path.match(domainRegex)[0];
      return `http://${result}`;
    }
  }

  return null;
}
