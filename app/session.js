const {EventEmitter} = require('events');
const {StringDecoder} = require('string_decoder');

let SerialPort;
SerialPort = require('serialport');

module.exports = class Session extends EventEmitter {
  constructor({port}) {
    super();

    const decoder = new StringDecoder('utf8');

    this.port = new SerialPort(port);

    this.port.on('data', data => {
      if (this.ended) {
        return;
      }
      this.emit('data', decoder.write(data));
    });

    this.port.on('close', () => {
      if (!this.ended) {
        this.ended = true;
        this.emit('exit');
      }
    });

    this.shell = 'serialport';
  }

  exit() {
    this.destroy();
  }

  write(data) {
    this.port.write(data);
  }

  resize() {}

  destroy() {
    this.port.close();
    this.emit('exit');
    this.ended = true;
  }
};
