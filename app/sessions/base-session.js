const {EventEmitter} = require('events');
const uuid = require('uuid');

class BaseSession extends EventEmitter {
  constructor() {
    super();
    this.uid = uuid.v4();
  }
}

module.exports = BaseSession;
