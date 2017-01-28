import React from 'react';
import styles from '../../xterm/xterm.css';
import Component from '../component';
import Xt from './xt';

class Term extends Component {
  constructor() {
    super();
  }
  
  componentDidMount() {
    this.xt = new Xt();
    this.xt.open(this.refs.terminal);
    // this.xt.fit();
		this.xt.writeln('Welcome to xterm.js');
		this.xt.writeln('Just type some keys in the prompt below.');
		this.xt.writeln('');
    console.log(this.xt);
  }
  
  template(css) {
    return (<div 
      ref="terminal"
      className={css('terminal')}
    />);
  }

  styles() {
    return styles;
  }
}

export default Term;
