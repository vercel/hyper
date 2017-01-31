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
    this._SizeListener = this._SizeListener.bind(this);
    this.xt._SizeListener = props.onResize.bind(null, this.uid);
    this._sendData = props.onData.bind(null, this.uid);
  }

  // onKey(key, ev) {
  // }
  
  _SizeListener() {
    const geox = this.xt.proposeGeometry();
    this.xt.resize(geox.cols, geox.rows);
    this.xt._SizeListener(geox.cols, geox.rows);
  }

  prompt(payload) {
    this.xt.write(payload);
  }

  init() {
    const {cols, rows} = this.xt;
    this.xt.init(cols, rows);
    this.xt.writeln('Welcome to xterm.js');
    this.xt.writeln('Just type some keys in the prompt below.');
    this.xt.writeln('');
    // this.xt.on('key', this.onKey);
    this.xt.on('data', this._sendData);
    function logResize(size) {
      console.log('Resized to ' + size.cols + ' cols and ' + size.rows + ' rows.');
    }
    this.xt.on('resize', logResize);
  }

  componentDidMount() {
    this.xt.open(this.terminal);
    this.xt.fit();
    this.init();
    window.addEventListener("resize", this._SizeListener);
  }

  componentWillReceiveProps(next) {
    const {write} = next;
    if (write && this.props.uid === write.uid) {
      this.prompt(write.data);
    }
  }

  template(css) {
    const {activeTerm} = this.props;
    return (<div
      ref={c => {
        this.terminal = c;
      }
    }
      className={css('terminal', activeTerm && 'activeTerm')}
      />);
  }

  styles() {
    return {
      styles,
      activeTerm: {
        // currently have resize error on close.
        // background: '#1C293A'
      }
    };
  }
}

export default Term;
