/*
 * Based on https://github.com/kevva/executable
 * Since this module doesn't expose the function to check stat mode only,
 * his logic is pasted here.
 *
 * Opened an issue and a pull request about it,
 * to maybe switch to module in the future:
 *
 * Issue: https://github.com/kevva/executable/issues/9
 * PR: https://github.com/kevva/executable/pull/10
 */

export default function isExecutable(fileStat) {
  if (process.platform === 'win32') {
    return true;
  }

  return Boolean(
    (fileStat.mode & 0o0001) ||
    (fileStat.mode & 0o0010) ||
    (fileStat.mode & 0o0100)
  );
}
