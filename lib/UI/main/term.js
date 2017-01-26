import React from 'react';
import Component from '../component';
// import * as Terminal from 'xterm';
import Terminal from '../../xterm/xterm';

class Term extends Component {
  constructor() {
    super();
  }
  
  componentDidMount() {
    this.term = new Terminal();
    this.term.open(this.refs.terminal);
    // console.log(term);
    // term.writeln('This is a local terminal emulation, without a real terminal in the back-end.');
    // term.writeln('Type some keys and commands to play around.');
    // term.writeln('');
    // term.scrollToBottom();
    // term.textarea.onkeydown = function (e) {
    //   console.log('User pressed key with keyCode: ', e.keyCode);
    //   term.scrollToBottom();
    // }
  }
  
  template(css) {
    return (<div 
      id="terminal"
      className={css('terminal')}
    />);
  }

  styles() {
    return {
      terminal: {
          display: 'block',
          width: '100%',
          height: '100%'  
      }
    };
  }
}

export default Term;
