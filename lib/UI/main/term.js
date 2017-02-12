import React from 'react';
import Component from '../component';
import rpc from '../../rpc';
import Xt from './xt';
import styles from './xterm.css'; // use previous styles

class Term extends Component {
  constructor(props) {
    super(props);
    console.log(window.keymapManager);
    this.uid = props.uid;
    this.xt = new Xt();
    this.xt.init = props.onInit.bind(null, this.uid);
    this._SizeListener = this._SizeListener.bind(this);
    this.xt._SizeListener = props.onResize.bind(null, this.uid);
    // this.focus = props.onSelect.bind(null, props.uid);
  }

  keyBind(ev) {
    if (window.keymapManager.isCommands(ev)) {
      return false;
    }
  }

  dataProcess(key) {
    rpc.emit('data', {uid: this.uid, data: key});
  }

  _SizeListener() {
    const geox = this.xt.proposeGeometry();
    const {cols, rows} = this.xt;
    if (cols !== geox.cols || rows !== geox.rows) {
      this.xt.resize(geox.cols, geox.rows);
      this.xt._SizeListener(geox.cols, geox.rows);
    }
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

  componentWillReceiveProps(next) {
    if (next.activeTerm) {
      // this.xt.focus();
      // // this.focus();
    }
    this._SizeListener();
  }

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
        // background: '#1C293A'
        // currently have resize error on close.
        // background: '#1C293A'
        // background: 'red'
      }
    };
  }
}

export default Term;
