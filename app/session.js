const {EventEmitter} = require('events');
const {StringDecoder} = require('string_decoder');

let SerialPort;
SerialPort = require('serialport');

module.exports = class Session extends EventEmitter {
  constructor({port, productId}) {
    super();

    const decoder = new StringDecoder('utf8');

    this.port = new SerialPort(port);

    this.port.on('data', data => {
      if (this.ended) {
        return;
      }
      this.emit('data', decoder.write(data));
    });

    let productIdMap = new Map([
      ['800b', 'Feather M0'],
      ['8015', 'Feather M0'],
      ['801b', 'Feather M0 Express'],
      ['8023', 'Feather M0 Express'],
      ['8011', 'CircuitPlayground Classic'],
      ['8013', 'Metro M0 Express'],
      ['8014', 'Metro M0 Express'],
      ['8018', 'CircuitPlayground Express'],
      ['8019', 'CircuitPlayground Express'],
      ['801c', 'Gemma M0'],
      ['801d', 'Gemma M0'],
      ['801e', 'Trinket M0'],
      ['801f', 'Trinket M0']
    ]);

    if (productIdMap.has(productId)) {
      this.title = productIdMap.get(productId);
    } else {
      this.title = 'Unknown Board';
    }

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
