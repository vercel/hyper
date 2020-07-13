import fetch from 'electron-fetch';
import {EventEmitter} from 'events';

class AutoUpdater extends EventEmitter implements Electron.AutoUpdater {
  updateURL!: string;
  quitAndInstall() {
    this.emitError('QuitAndInstall unimplemented');
  }
  getFeedURL() {
    return this.updateURL;
  }

  setFeedURL(options: Electron.FeedURLOptions) {
    this.updateURL = options.url;
  }

  checkForUpdates() {
    if (!this.updateURL) {
      return this.emitError('Update URL is not set');
    }
    this.emit('checking-for-update');

    fetch(this.updateURL)
      .then((res) => {
        if (res.status === 204) {
          this.emit('update-not-available');
          return;
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

  emitError(error: string | Error) {
    if (typeof error === 'string') {
      error = new Error(error);
    }
    this.emit('error', error);
  }
}

export default new AutoUpdater();
