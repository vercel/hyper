/*global fetch:false*/
import { version as currentVersion } from '../package';
import compare from 'semver-compare';

export default class UpdateChecker {

  constructor (fn, { interval = 5000 } = {}) {
    this.callback = fn;
    this.interval = interval;
    this.check();
    this.lastKnown = null;
  }

  check () {
    const done = () => {
      this.checkTimer = setTimeout(() => {
        this.check();
      }, this.interval);
    };

    console.log('checking for update');
    fetch('https://hyperterm.now.sh/updates.json')
    .then((res) => {
      if (200 !== res.status) {
        console.error('Update check error. Status (%d)', res.status);
        return done();
      }

      res.json()
      .then(({ version, note }) => {
        if (this.lastKnown !== version) {
          this.lastKnown = version;

          if (1 === compare(version, currentVersion)) {
            console.log('update found');
            this.callback(version, note);
          } else {
            console.log('no update. latest:', version);
          }
        }
        done();
      })
      .catch((err) => {
        console.error('Update JSON parse error', err.stack);
        done();
      });
    }).catch((err) => {
      console.error('Update check error', err.stack);
      done();
    });
  }

  destroy () {
    this.aborted = true;
    clearTimeout(this.checkTimer);
  }

}
