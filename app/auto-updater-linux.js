'use strict';

const fetch = require('node-fetch');
const {EventEmitter} = require('events');

class AutoUpdater extends EventEmitter {
  quitAndInstall() {
    this.emitError('QuitAndInstall unimplemented');
  }
  getFeedURL() {
    return this.updateURL;
  }

  setFeedURL(updateURL) {
    this.updateURL = updateURL;
  }

  checkForUpdates() {
    if (!this.updateURL) {
      return this.emitError('Update URL is not set');
    }
    this.emit('checking-for-update');

    fetch(this.updateURL)
      .then(res => {
        if (res.status === 204) {
          return this.emit('update-not-available');
        }
        return res.json().then(({name, notes, pub_date}) => {
          // Only name is mandatory, needed to construct release URL.
          if (!name) {
            throw new Error('Malformed server response: release name is missing.');
          }
          // If `null` is passed to Date constructor, current time will be used. This doesn't work with `undefined`
          const date = new Date(pub_date || null);
          this.emit('update-available', {}, notes, name, date);
        });
      })
      .catch(this.emitError.bind(this));
  }

  emitError(error) {
    if (typeof error === 'string') {
      error = new Error(error);
    }
    this.emit('error', error, error.message);
  }
}

module.exports = new AutoUpdater();
