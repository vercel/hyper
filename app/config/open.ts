import {shell} from 'electron';
import {cfgPath} from './paths';
import * as regTypes from '../typings/native-reg';

export default () => {
  // Windows opens .js files with  WScript.exe by default
  // If the user hasn't set up an editor for .js files, we fallback to notepad.
  if (process.platform === 'win32') {
    try {
      // eslint-disable-next-line no-var, @typescript-eslint/no-var-requires
      var Registry: typeof regTypes = require('native-reg');
    } catch (err) {
      console.error(err);
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {exec} = require('child_process') as typeof import('child_process');

    const getUserChoiceKey = async () => {
      try {
        // Load FileExts keys for .js files
        const fileExtsKeys = Registry.openKey(
          Registry.HKCU,
          'Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.js',
          Registry.Access.READ
        );
        const keys = fileExtsKeys ? Registry.enumKeyNames(fileExtsKeys) : [];
        Registry.closeKey(fileExtsKeys);

        // Find UserChoice key
        const userChoice = keys.find((k) => k.endsWith('UserChoice'));
        return userChoice
          ? `Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.js\\${userChoice}`
          : userChoice;
      } catch (error) {
        console.error(error);
        return;
      }
    };

    const hasDefaultSet = async () => {
      const userChoice = await getUserChoiceKey();
      if (!userChoice) return false;

      try {
        // Load key values
        const userChoiceKey = Registry.openKey(Registry.HKCU, userChoice, Registry.Access.READ)!;
        const values: string[] = Registry.enumValueNames(userChoiceKey).map(
          (x) => (Registry.queryValue(userChoiceKey, x) as string) || ''
        );
        Registry.closeKey(userChoiceKey);

        // Look for default program
        const hasDefaultProgramConfigured = values.every(
          (value) => value && typeof value === 'string' && !value.includes('WScript.exe') && !value.includes('JSFile')
        );

        return hasDefaultProgramConfigured;
      } catch (error) {
        console.error(error);
        return false;
      }
    };

    // This mimics shell.openItem, true if it worked, false if not.
    const openNotepad = (file: string) =>
      new Promise<boolean>((resolve) => {
        exec(`start notepad.exe ${file}`, (error) => {
          resolve(!error);
        });
      });

    return hasDefaultSet()
      .then((yes) => {
        if (yes) {
          return shell.openPath(cfgPath).then((error) => error === '');
        }
        console.warn('No default app set for .js files, using notepad.exe fallback');
        return openNotepad(cfgPath);
      })
      .catch((err) => {
        console.error('Open config with default app error:', err);
        return openNotepad(cfgPath);
      });
  } else {
    return Promise.resolve(shell.openPath(cfgPath).then((error) => error === ''));
  }
};
