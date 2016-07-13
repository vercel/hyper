import * as regex from './url-regex';

export default function isUrlCommand (data) {
  let match = data.match(regex.bash);
  let url;

  if (match) {
    url = match[5];
  } else {
    match = data.match(regex.zsh);
    if (match) {
      url = match[7];
    } else {
      match = data.match(regex.fish);
      if (match) {
        url = match[4];
      }
    }
  }

  if (url) {
    // extract the domain portion from the url
    const domain = url.split('/')[0];
    if (regex.domain.test(domain)) {
      return toURL(url);
    }
  }
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
