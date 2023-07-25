import type {ExecFileOptions, ExecOptions} from 'child_process';

import {ipcRenderer} from './ipc';

export function exec(command: string, options: ExecOptions, callback: (..._args: any) => void) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  ipcRenderer.invoke('child_process.exec', command, options).then(
    ({stdout, stderr}) => callback?.(null, stdout, stderr),
    (error) => callback?.(error, '', '')
  );
}

export function execSync() {
  console.error('Calling execSync from renderer is disabled');
}

export function execFile(file: string, args: string[], options: ExecFileOptions, callback: (..._args: any) => void) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (typeof args === 'function') {
    callback = args;
    args = [];
    options = {};
  }
  ipcRenderer.invoke('child_process.execFile', file, args, options).then(
    ({stdout, stderr}) => callback?.(null, stdout, stderr),
    (error) => callback?.(error, '', '')
  );
}

export function execFileSync() {
  console.error('Calling execFileSync from renderer is disabled');
}

export function spawn() {
  console.error('Calling spawn from renderer is disabled');
}

export function spawnSync() {
  console.error('Calling spawnSync from renderer is disabled');
}

export function fork() {
  console.error('Calling fork from renderer is disabled');
}

const IPCChildProcess = {
  exec,
  execSync,
  execFile,
  execFileSync,
  spawn,
  spawnSync,
  fork
};

export default IPCChildProcess;
