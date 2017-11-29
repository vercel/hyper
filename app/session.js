const {EventEmitter} = require('events');
const {StringDecoder} = require('string_decoder');

const {app} = require('electron');

const {getDecoratedEnv} = require('./plugins');
const {productName, version} = require('./package');
const config = require('./config');

let SerialPort;
SerialPort = require('serialport');


module.exports = class Session extends EventEmitter {
  constructor({rows, cols: columns, cwd, port, shellArgs}) {
    super();

    console.log("starting session!");
    console.log(port);
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

    this.shell = "serialport";
  }

  exit() {
    this.destroy();
  }

  write(data) {
    this.port.write(data);
  }

  resize({cols, rows}) {
  }

  destroy() {
    this.port.close();
    this.emit('exit');
    this.ended = true;
  }
};
