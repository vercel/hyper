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
        console.log('Launching yarn:', cmd);

        cp.exec(cmd, {
          cwd: plugs.base,
          env,
          shell: true,
          timeout: ms('5m'),
          stdio: ['ignore', 'ignore', 'inherit']
        }, err => {
          if (err) {
            cb(err);
          } else {
            cb(null);
          }

          end();
          spawnQueue.start();
        });
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
