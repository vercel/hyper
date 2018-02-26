// @flow
import path from 'path';
import * as regex from './url-regex';

export default function isUrlCommand(shell: string, data: string): string | null {
  const matcher = regex[path.parse(shell).name];
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
