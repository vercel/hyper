const uuid = require('uuid');

class BaseSession {
  constructor() {
    this.uid = uuid.v4();
  }

}


module.exports =  BaseSession;

