/*
getCWD kindly taken from henrikdahl's plugin hyper statusline

https://github.com/henrikdahl/hyper-statusline/blob/master/index.js
*/

import {exec} from 'child_process';

export default function getCWD(pid, action) {
  let cwd;
  return new Promise(res => {
    if (process.platform == 'win32') {
      let directoryRegex = /([a-zA-Z]+)/im;
      if (action && action.data) {
        let path = directoryRegex.exec(action.data);
        if (path) {
          cwd = path[0];
          res(cwd);
        }
      }
    } else {
      exec(
        `lsof -p ${pid} | awk '$4=="cwd"' | tr -s ' ' | cut -d ' ' -f9-`,
        {
          encoding: 'utf8'
        },
        (err, stdout) => {
          cwd = `/${stdout
            .split('/')
            .pop()
            .trim()}`;
          res(`${cwd}`);
        }
      );
    }
  });
}
