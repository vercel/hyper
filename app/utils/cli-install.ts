import pify from 'pify';
import fs from 'fs';
import path from 'path';
import notify from '../notify';
import {cliScriptPath, cliLinkPath} from '../config/paths';

import * as regTypes from '../typings/native-reg';
if (process.platform === 'win32') {
  try {
    // eslint-disable-next-line no-var, @typescript-eslint/no-var-requires
    var Registry: typeof regTypes = require('native-reg');
  } catch (err) {
    console.error(err);
  }
}

const readlink = pify(fs.readlink);
const symlink = pify(fs.symlink);

const checkInstall = () => {
  return readlink(cliLinkPath)
    .then((link) => link === cliScriptPath)
    .catch((err) => {
      if (err.code === 'ENOENT') {
        return false;
      }
      throw err;
    });
};

const addSymlink = () => {
  return checkInstall().then((isInstalled) => {
    if (isInstalled) {
      console.log('Hyper CLI already in PATH');
      return Promise.resolve();
    }
    console.log('Linking HyperCLI');
    return symlink(cliScriptPath, cliLinkPath);
  });
};

const addBinToUserPath = () => {
  return new Promise((resolve, reject) => {
    try {
      const envKey = Registry.openKey(Registry.HKCU, 'Environment', Registry.Access.ALL_ACCESS)!;

      // C:\Users\<user>\AppData\Local\hyper\app-<version>\resources\bin
      const binPath = path.dirname(cliScriptPath);
      // C:\Users\<user>\AppData\Local\hyper
      const basePath = path.resolve(binPath, '../../..');

      const items = Registry.enumValueNames(envKey);
      const pathItem = items.find((item) => item.toUpperCase() === 'PATH');
      const pathItemName = pathItem || 'PATH';

      let newPathValue = binPath;
      let type: regTypes.ValueType = Registry.ValueType.SZ;
      if (pathItem) {
        type = Registry.queryValueRaw(envKey, pathItem)!.type;
        if (type !== Registry.ValueType.SZ && type !== Registry.ValueType.EXPAND_SZ) {
          reject(`Registry key type is ${type}`);
          return;
        }
        const value = Registry.queryValue(envKey, pathItem) as string;
        const pathParts = value.split(';');
        const existingPath = pathParts.includes(binPath);
        if (existingPath) {
          console.log('Hyper CLI already in PATH');
          resolve();
          return;
        }

        // Because version is in path we need to remove old path if present and add current path
        newPathValue = pathParts
          .filter((pathPart) => !pathPart.startsWith(basePath))
          .concat([binPath])
          .join(';');
      }
      console.log('Adding HyperCLI path (registry)');
      Registry.setValueRaw(envKey, pathItemName, type, Registry.formatString(newPathValue));
      Registry.closeKey(envKey);
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

export const installCLI = (withNotification: boolean) => {
  if (process.platform === 'win32') {
    addBinToUserPath()
      .then(() =>
        logNotify(
          withNotification,
          'Hyper CLI installed',
          'You may need to restart your computer to complete this installation process.'
        )
      )
      .catch((err) =>
        logNotify(withNotification, 'Hyper CLI installation failed', `Failed to add Hyper CLI path to user PATH ${err}`)
      );
  } else if (process.platform === 'darwin') {
    addSymlink()
      .then(() => logNotify(withNotification, 'Hyper CLI installed', `Symlink created at ${cliLinkPath}`))
      .catch((err) => {
        // 'EINVAL' is returned by readlink,
        // 'EEXIST' is returned by symlink
        const error =
          err.code === 'EEXIST' || err.code === 'EINVAL'
            ? `File already exists: ${cliLinkPath}`
            : `Symlink creation failed: ${err.code}`;

        console.error(err);
        logNotify(withNotification, 'Hyper CLI installation failed', error);
      });
  } else {
    withNotification &&
      notify('Hyper CLI installation', 'Command is added in PATH only at package installation. Please reinstall.');
  }
};
