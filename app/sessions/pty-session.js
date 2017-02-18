const {StringDecoder} = require('string_decoder');
const {app} = require('electron');
const {isAbsolute} = require('path');
const {homedir} = require('os');
const Base = require('./base-session');
const defaultShell = require('default-shell');
const {getDecoratedEnv} = require('../plugins');
const {productName, version} = require('../package');
const config = require('../config');

const createNodePtyError = () => new Error('`pty.js` failed to load. Typically this means that it was built incorrectly. Please check the `README.me` to more info.');

let spawn;
try {
  spawn = require('node-pty').spawn;
} catch (err) {
  throw createNodePtyError();
}

class psess extends Base {
  constructor({uid, cols: columns, rows, shell, shellArgs}) {
    super();
    this.uid = uid;
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
        cols: columns,
        rows,
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
    
    this.term.on('data', data => {
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
    this.term.write(data);
  }
  
  resize({cols, rows}) {
    try {
      this.term.resize(cols, rows);
    } catch (err) {
      console.error(err.stack);
    }
  }

}
  
module.exports = psess;
