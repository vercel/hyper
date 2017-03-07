import * as regex from './url-regex';

export default function isUrlCommand(shell, data) {
  const matcher = regex[shell]; // eslint-disable-line import/namespace
  if (undefined === matcher || !data) {
    return null;
  }

  const match = data.match(matcher);
  const urlRegex = /((?:https?:\/\/)(?:[-a-z0-9]+\.)*[-a-z0-9]+.*)/;

  if (match && urlRegex.test(match[2])) {
    return `${match[2]}`;
  }

  return null;
}
