const {StringDecoder} = require('string_decoder');
const {app} = require('electron');
const {isAbsolute} = require('path');
const {homedir} = require('os');
const Base = require('./base-session');
const defaultShell = require('default-shell');
const {getDecoratedEnv} = require('../plugins');
const {productName, version} = require('../package');
const config = require('../config');

const createPtyJsError = () => new Error('`pty.js` failed to load. Typically this means that it was built incorrectly. Please check the `README.me` to more info.');

let spawn;
try {
  spawn = require('pty.js').spawn;
} catch (err) {
  throw createPtyJsError();
}

class psess extends Base {
  constructor({rows, cols, shell, shellArgs}) {
    super();
    // this.shell = shell;
    // this.shellArgs = shellArgs;
    const cwd = process.argv[1] && isAbsolute(process.argv[1]) ? process.argv[1] : homedir();
    const baseEnv = Object.assign({}, process.env, {
      LANG: app.getLocale().replace('-', '_') + '.UTF-8',
      TERM: 'xterm-256color',
      TERM_PROGRAM: productName,
      TERM_PROGRAM_VERSION: version
    },  config.getConfig().env || {});
    
    const decoder = new StringDecoder('utf8');

    const defaultShellArgs = ['--login'];
    this.shell = shell || defaultShell;
    
    try {
      this.term = spawn(this.shell, shellArgs || defaultShellArgs, {
        cols: cols || 80,
        rows: rows || 24,
        cwd,
        env: getDecoratedEnv(baseEnv)
      });
    } catch (err) {
      if (/is not a function/.test(err.message)) {
        throw createPtyJsError();
      } else {
        throw err;
      }
    }
    
    this.term.stdout.on('data', data => {
      if (this.ended) {
        return;
      }
      const payload = {uid:this.uid, data: decoder.write(data)};
      this.emit('data', payload);
    });
    // 
    // if(this.term) {
    //   this.term.kill();    
    // }

  }

  write(data) {
    this.term.stdin.write(data);
  }

}
  
module.exports = psess;
