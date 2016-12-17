import * as regex from './url-regex';

export default function isUrlCommand(shell, data) {
  const matcher = regex[shell]; // eslint-disable-line import/namespace
  if (undefined === matcher || !data) {
    return null;
  }

  const match = data.match(matcher);
  const urlRegex = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!]))?/;

  if (match && urlRegex.test(match[2])) {
    return `${match[2]}`;
  }

  return null;
}
