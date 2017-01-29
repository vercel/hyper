import React from 'react';
import styles from '../../xterm/xterm.css';
import Component from '../component';
import Xt from './xt';

class Term extends Component {
  constructor(props) {
    super(props);
    this.uid = props.uid;
    this.xt = new Xt();
    this.xt.init = props.onInit.bind(null, this.uid);
    this._sendData = props.onData.bind(null, this.uid);
    // this.xt.resize = props.onResize.bind(null, this.uid);
  }
  
  onKey(key, ev) {
  }
  
  prompt(payload) {
    this.xt.write(payload);
  }
  
  init() {
    const {cols, rows} = this.xt;
    this.xt.init(cols,rows);
    this.xt.writeln('Welcome to xterm.js');
    this.xt.writeln('Just type some keys in the prompt below.');
    this.xt.writeln('');
    this.xt.on('key', this.onKey);
    this.xt.on('data', this._sendData);
  }
  
  componentDidMount() {
    this.xt.open(this.refs.terminal);
    this.xt.fit();
    this.init();
  }
  
  componentWillReceiveProps(next) {
    const {write, uid} = next;
    if (write && this.props.uid === write.uid) {
      this.prompt(write.data);
    }
  }

  template(css) {
    const {activeTerm} = this.props;
    return (<div 
      ref="terminal"
      className={css('terminal', activeTerm && 'activeTerm')}
    />);
  }

  styles() {
    return {
        styles,
        activeTerm: {
          // currently have resize error on close.          
          // background: '#1C293A'
          // background: 'red'
        }
      };
  }
}

export default Term;
