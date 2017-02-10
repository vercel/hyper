import React from 'react';
import styles from '../../xterm/xterm.css';
import Component from '../component';
import {isAccelerator} from '../../../app/accelerators';
import rpc from '../../rpc';
import Xt from './xt';

class Term extends Component {
  constructor(props) {
    super(props);
    this.uid = props.uid;
    this.xt = new Xt();
    this.xt.init = props.onInit.bind(null, this.uid);
    this._SizeListener = this._SizeListener.bind(this);
    this.xt._SizeListener = props.onResize.bind(null, this.uid);
    // this.xt.onArrow = props.onArrow;
    // this.xt.focus = props.onSelect.bind(null, props.uid);
  }

  keyBind(ev) {
    if (isAccelerator(ev)) {
      return false;
    }
  }

  dataProcess(key) {
    rpc.emit('data', {uid: this.uid, data: key});
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
      if (this.uid === uid) {
        this.xt.write(data);
      }
    });
    this.xt.writeln('Welcome to xterm.js');
    this.xt.writeln('Just type some keys in the prompt below.');
    this.xt.writeln('');
    this.xt.attachCustomKeydownHandler(this.keyBind);
    this.xt.on('data', this.dataProcess.bind(this));
  }

  componentDidMount() {
    this.xt.open(this.terminal);
    this.xt.fit();
    this.init();
    window.addEventListener('resize', this._SizeListener);
  }

  // componentWillReceiveProps(next) {
  //   // if (next.activeTerm) {
  //     // this.focus();
  //     // this.xt.textarea.focus();
  //   // }
  //   // this._SizeListener();
  // }

  template(css) {
    const {activeTerm} = this.props;
    return (<div
      ref={t => {
        this.terminal = t;
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
        // background: 'red'
      }
    };
  }
}

export default Term;
