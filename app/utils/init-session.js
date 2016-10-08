const uuid = require('uuid');
const Session = require('../session');

module.exports = (opts, fn) => {
  if (opts.uid) {
    fn(opts.uid, new Session(opts));
  } else {
    fn(uuid.v4(), new Session(opts));
  }
};
