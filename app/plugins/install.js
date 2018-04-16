const cp = require('child_process');
const queue = require('queue');
const ms = require('ms');
const {yarn, plugs} = require('../config/paths');

module.exports = {
  install: fn => {
    const spawnQueue = queue({concurrency: 1});
    function yarnFn(args, cb) {
      const env = {
        NODE_ENV: 'production',
        ELECTRON_RUN_AS_NODE: 'true'
      };
      spawnQueue.push(end => {
        const cmd = [process.execPath, yarn].concat(args).join(' ');
        //eslint-disable-next-line no-console
        console.log('Launching yarn:', cmd);

        cp.execFile(
          process.execPath,
          [yarn].concat(args),
          {
            cwd: plugs.base,
            env,
            timeout: ms('5m'),
            maxBuffer: 1024 * 1024
          },
          (err, stdout, stderr) => {
            if (err) {
              cb(stderr);
            } else {
              cb(null);
            }
            end();
            spawnQueue.start();
          }
        );
      });

      spawnQueue.start();
    }

    yarnFn(['install', '--no-emoji', '--no-lockfile', '--cache-folder', plugs.cache], err => {
      if (err) {
        return fn(err);
      }
      fn(null);
    });
  }
};
