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

import fs from 'fs';
import type {Stats} from 'fs';

export function isExecutable(fileStat: Stats): boolean {
  if (process.platform === 'win32') {
    return true;
  }

  return Boolean(fileStat.mode & 0o0001 || fileStat.mode & 0o0010 || fileStat.mode & 0o0100);
}

export function getBase64FileData(filePath: string): Promise<string | null> {
  return new Promise((resolve): void => {
    return fs.readFile(filePath, (err, data) => {
      if (err) {
        // Gracefully fail with a warning
        console.warn('There was an error reading the file at the local location:', err);
        return resolve(null);
      }

      const base64Data = Buffer.from(data).toString('base64');
      return resolve(base64Data);
    });
  });
}
