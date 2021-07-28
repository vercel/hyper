import {ipcRenderer} from 'electron';

export function exec(command: string, options?: any, callback?: (..._args: any) => void) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  ipcRenderer.invoke('child_process.exec', {command, options}).then(
    ({stdout, stderr}) => callback?.(null, stdout, stderr),
    (error) => callback?.(error, '', '')
  );
}

export function execSync() {
  console.error('Calling execSync from renderer is disabled');
}

export function execFile(file: string, args?: any, options?: any, callback?: (..._args: any) => void) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  if (typeof args === 'function') {
    callback = args;
    args = null;
    options = null;
  }
  ipcRenderer.invoke('child_process.execFile', {file, args, options}).then(
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

export default {
  exec,
  execSync,
  execFile,
  execFileSync,
  spawn,
  spawnSync,
  fork
};
