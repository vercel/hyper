import React from 'react';
import styles from '../../xterm/xterm.css';
import Component from '../component';
import Xt from './xt';

class Term extends Component {
  constructor(props) {
    super(props);
    this.uid = props.uid;
    this.xt = new Xt();
    this._sendData = props.onData.bind(null, this.uid);
    
  }
  
  onKey(key, ev) {
    // console.log(key);
    // console.log(this.uid);
    // this.prompt(key);
    // this.sendData(this.uid, key);
  }
  
  prompt(payload) {
    this.xt.write(payload);
  }
  
  componentDidMount() {
    this.xt.open(this.refs.terminal);
    this.xt.fit();
		this.xt.writeln('Welcome to xterm.js');
		this.xt.writeln('Just type some keys in the prompt below.');
		this.xt.writeln('');
    this.xt.on('key', this.onKey);
    this.xt.on('data', this._sendData);
  }
  
  componentWillReceiveProps(next) {
    const {write, uid} = next;
    if (write && this.props.uid === write.uid) {
      this.prompt(write.data);
    }
  }
  // onData
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
