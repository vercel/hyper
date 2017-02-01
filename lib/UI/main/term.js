import React from 'react';
import styles from '../../xterm/xterm.css';
import Component from '../component';
import Xt from './xt';
import {isAccelerator} from '../../../app/accelerators';
import rpc from '../../rpc';

class Term extends Component {
  constructor(props) {
    super(props);
    this.uid = props.uid;
    this.xt = new Xt();
    this.xt.init = props.onInit.bind(null, this.uid);
    this.onKey = this.onKey.bind(this);
    this._SizeListener = this._SizeListener.bind(this);
    this.xt._SizeListener = props.onResize.bind(null, this.uid);
    // this._sendData = props.onData.bind(null, this.uid);
  }

  onKey(key, ev) {
    if (ev.altKey || ev.metaKey || isAccelerator(ev)) {
      console.log(isAccelerator(ev));
      return;
    }

    rpc.emit('data', {uid: this.uid, data: key});
    // this._sendData(key);
  }
  
  _SizeListener() {
    const geox = this.xt.proposeGeometry();
    this.xt.resize(geox.cols, geox.rows);
    this.xt._SizeListener(geox.cols, geox.rows);
  }

  init() {
    const {cols, rows} = this.xt;
    this.xt.init(cols, rows);
    rpc.on('pty data', ({uid, data}) => {
      if(this.uid === uid) {
        this.xt.write(data);
      }
    });
    this.xt.writeln('Welcome to xterm.js');
    this.xt.writeln('Just type some keys in the prompt below.');
    this.xt.writeln('');
    this.xt.on('key', this.onKey);
  }

  componentDidMount() {
    this.xt.open(this.terminal);
    this.xt.fit();
    this.init();
    window.addEventListener("resize", this._SizeListener);
  }

  componentWillReceiveProps(next) {
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
