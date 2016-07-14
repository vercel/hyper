import * as regex from './url-regex';

export const domainRegex = /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/;

export default function isUrlCommand (shell, data) {
  const matcher = regex[shell];
  if (undefined === matcher) return null;
  let url, i;

  switch (matcher) {
    case regex.bash:
      i = 5;
      break;

    case regex.zsh:
      i = 7;
      break;

    case regex.fish:
      i = 4;
      break;
  }

  let match = data.match(matcher);

  if (match) {
    url = match[i];
    if (url) {
      // extract the domain portion from the url
      const domain = url.split('/')[0];
      if (domainRegex.test(domain)) {
        return toURL(url);
      }
    }
  }

  return null;
}

function toURL (domain) {
  if (/^https?:\/\//.test(domain)) {
    return domain;
  }

  if ('//' === domain.substr(0, 2)) {
    return domain;
  }

  return 'http://' + domain;
}
