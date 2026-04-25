import {execFile} from 'child_process';
import {existsSync, readlink, symlink} from 'fs';
import path from 'path';
import {promisify} from 'util';

import {clipboard, dialog} from 'electron';

import {mkdirpSync} from 'fs-extra';
import * as Registry from 'native-reg';
import type {ValueType} from 'native-reg';
import sudoPrompt from 'sudo-prompt';

import {cliScriptPath, cliLinkPath} from '../config/paths';
import notify from '../notify';

import {BROADCAST_PS_SCRIPT, encodePowerShellCommand, POWERSHELL_BROADCAST_ARGS} from './broadcast-env-change';

const readLink = promisify(readlink);
const symLink = promisify(symlink);
const sudoExec = promisify(sudoPrompt.exec);
const execFileP = promisify(execFile);

const checkInstall = () => {
  return readLink(cliLinkPath)
    .then((link) => link === cliScriptPath)
    .catch((err) => {
      if (err.code === 'ENOENT') {
        return false;
      }
      throw err;
    });
};

const addSymlink = async (silent: boolean) => {
  try {
    const isInstalled = await checkInstall();
    if (isInstalled) {
      console.log('Hyper CLI already in PATH');
      return;
    }
    console.log('Linking HyperCLI');
    if (!existsSync(path.dirname(cliLinkPath))) {
      try {
        mkdirpSync(path.dirname(cliLinkPath));
      } catch (err) {
        throw `Failed to create directory ${path.dirname(cliLinkPath)} - ${err}`;
      }
    }
    await symLink(cliScriptPath, cliLinkPath);
  } catch (_err) {
    const err = _err as {code: string};
    // 'EINVAL' is returned by readlink,
    // 'EEXIST' is returned by symlink
    let error =
      err.code === 'EEXIST' || err.code === 'EINVAL'
        ? `File already exists: ${cliLinkPath}`
        : `Symlink creation failed: ${err.code}`;
    // Need sudo access to create symlink
    if (err.code === 'EACCES' && !silent) {
      const result = await dialog.showMessageBox({
        message: `You need to grant elevated privileges to add Hyper CLI to PATH
Or you can run
sudo ln -sf "${cliScriptPath}" "${cliLinkPath}"`,
        type: 'info',
        buttons: ['OK', 'Copy Command', 'Cancel']
      });
      if (result.response === 0) {
        try {
          await sudoExec(`ln -sf "${cliScriptPath}" "${cliLinkPath}"`, {name: 'Hyper'});
          return;
        } catch (_error) {
          error = (_error as any[])[0];
        }
      } else if (result.response === 1) {
        clipboard.writeText(`sudo ln -sf "${cliScriptPath}" "${cliLinkPath}"`);
      }
    }
    throw error;
  }
};

// Tells the rest of Windows that the user's PATH changed so already-running
// shells / Explorer pick up the new value without requiring a logout or
// reboot. See ./broadcast-env-change.ts for the why and the WinAPI details.
// Failure here is non-fatal: the registry value is already persisted, so a
// reboot/logout still works as the fallback.
const broadcastEnvChange = async (): Promise<boolean> => {
  try {
    await execFileP('powershell.exe', [...POWERSHELL_BROADCAST_ARGS, encodePowerShellCommand(BROADCAST_PS_SCRIPT)], {
      windowsHide: true,
      timeout: 10000
    });
    return true;
  } catch (err) {
    console.warn('Failed to broadcast WM_SETTINGCHANGE for PATH update', err);
    return false;
  }
};

const addBinToUserPath = () => {
  return new Promise<void>((resolve, reject) => {
    try {
      const envKey = Registry.openKey(Registry.HKCU, 'Environment', Registry.Access.ALL_ACCESS)!;

      // C:\Users\<user>\AppData\Local\Programs\hyper\resources\bin
      const binPath = path.dirname(cliScriptPath);
      // C:\Users\<user>\AppData\Local\hyper
      const oldPath = path.resolve(process.env.LOCALAPPDATA!, 'hyper');

      const items = Registry.enumValueNames(envKey);
      const pathItem = items.find((item) => item.toUpperCase() === 'PATH');
      const pathItemName = pathItem || 'PATH';

      let newPathValue = binPath;
      let type: ValueType = Registry.ValueType.SZ;
      if (pathItem) {
        type = Registry.queryValueRaw(envKey, pathItem)!.type;
        if (type !== Registry.ValueType.SZ && type !== Registry.ValueType.EXPAND_SZ) {
          reject(`Registry key type is ${type}`);
          return;
        }
        const value = Registry.queryValue(envKey, pathItem) as string;
        let pathParts = value.split(';');
        const existingPath = pathParts.includes(binPath);
        const existingOldPath = pathParts.some((pathPart) => pathPart.startsWith(oldPath));
        if (existingPath && !existingOldPath) {
          console.log('Hyper CLI already in PATH');
          Registry.closeKey(envKey);
          resolve();
          return;
        }

        // Because nsis install path is different from squirrel we need to remove old path if present
        // and add current path if absent
        if (existingOldPath) pathParts = pathParts.filter((pathPart) => !pathPart.startsWith(oldPath));
        if (!pathParts.includes(binPath)) pathParts.push(binPath);
        newPathValue = pathParts.join(';');
      }
      console.log('Adding HyperCLI path (registry)');
      Registry.setValueRaw(envKey, pathItemName, type, Registry.formatString(newPathValue));
      Registry.closeKey(envKey);

      // Update the running Hyper process's PATH so any shells spawned from
      // within Hyper (or commands run via child_process) see the CLI right
      // away, without waiting on the broadcast or a reboot.
      const binPathDir = path.dirname(cliScriptPath);
      const currentRuntimePath = process.env.Path || process.env.PATH || '';
      if (!currentRuntimePath.split(';').some((entry) => entry.toLowerCase() === binPathDir.toLowerCase())) {
        const updated = currentRuntimePath ? `${currentRuntimePath};${binPathDir}` : binPathDir;
        process.env.Path = updated;
        process.env.PATH = updated;
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

const logNotify = (withNotification: boolean, title: string, body: string, details?: {error?: any}) => {
  console.log(title, body, details);
  withNotification && notify(title, body, details);
};

export const installCLI = async (withNotification: boolean) => {
  if (process.platform === 'win32') {
    try {
      await addBinToUserPath();
      const broadcasted = await broadcastEnvChange();
      logNotify(
        withNotification,
        'Hyper CLI installed',
        broadcasted
          ? 'Hyper CLI is now on your PATH. Open a new terminal window to use it.'
          : 'You may need to open a new terminal session (or restart your computer) to complete this installation process.'
      );
    } catch (err) {
      logNotify(withNotification, 'Hyper CLI installation failed', `Failed to add Hyper CLI path to user PATH ${err}`);
    }
  } else if (process.platform === 'darwin' || process.platform === 'linux') {
    // AppImages are mounted on run at a temporary path, don't create symlink
    if (process.env['APPIMAGE']) {
      console.log('Skipping CLI symlink creation as it is an AppImage install');
      return;
    }
    try {
      await addSymlink(!withNotification);
      logNotify(withNotification, 'Hyper CLI installed', `Symlink created at ${cliLinkPath}`);
    } catch (error) {
      logNotify(withNotification, 'Hyper CLI installation failed', `${error}`);
    }
  } else {
    logNotify(withNotification, 'Hyper CLI installation failed', `Unsupported platform ${process.platform}`);
  }
};
