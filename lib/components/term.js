/* global Blob,URL,requestAnimationFrame */
import React from 'react';
import Terminal from 'xterm';
import Component from '../component';
import terms from '../terms';
import returnKey from '../utils/keymaps';
import CommandRegistry from '../command-registry';

// map old hterm constants to xterm.js
const CURSOR_STYLES = {
  BEAM: 'bar',
  UNDERLINE: 'underline',
  BLOCK: 'block'
}

export default class Term extends Component {

  constructor(props) {
    super(props);
    props.ref_(this);
    this.termRef = null
    this.onWindowResize = this.onWindowResize.bind(this)
  }

  componentDidMount() {
    const {props} = this;

    this.term = props.term || new Terminal({
      cursorStyle: CURSOR_STYLES[props.cursorShape],
      cursorBlink: props.cursorBlink,
      cols: props.cols,
      rows: props.rows
    });

    if (!props.term) {
      this.term.attachCustomKeyEventHandler(this.keyboardHandler);
    }

    this.term.open(this.termRef)

    if (props.onTitle) {
      this.term.on(
        'title',
        props.onTitle
      )
    }

    if (props.onActive) {
      this.term.on(
        'focus',
        props.onActive
      )
    }

    if (props.onData) {
      this.term.on(
        'data',
        props.onData
      )
    }

    if (props.onResize) {
      this.term.on(
        'resize',
        ({ cols, rows }) => {
          props.onResize(cols, rows)
        }
      )
    }

    window.addEventListener('resize', this.onWindowResize)

    terms[this.props.uid] = this;
  }

  getTermDocument () {
    // eslint-disable-next-line no-console
    console.error('unimplemented')
  }

  onWindowResize() {
    // eslint-disable-next-line no-console
    console.error('unimplemented')
  }

  write(data) {
    this.term.write(data);
  }

  focus() {
    this.term.focus();
  }

  clear() {
    this.term.clear();
    this.term.onVTKeystroke('\f');
  }

  keyboardHandler(e) {
    // test key from keymaps before moving forward with actions
    const key = returnKey(e);
    if (key) {
      if (CommandRegistry.getCommand(key)) {
        CommandRegistry.exec(key, e);
      }
      return false;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.cleared && nextProps.cleared) {
      this.clear();
    }
  }

  componentWillUnmount() {
    terms[this.props.uid] = this;
    this.props.ref_(null);
  }

  template(css) {
    return (<div
      ref={component => {
        this.termWrapperRef = component;
      }}
      className={css('fit', this.props.isTermActive && 'active')}
      style={{padding: this.props.padding}}
      >
      { this.props.customChildrenBefore }
      <div
        ref={component => {
          this.termRef = component;
        }}
        className={css('fit', 'term')}
        />
      { this.props.customChildren }
    </div>);
  }

  styles() {
    return {
      fit: {
        display: 'block',
        width: '100%',
        height: '100%'
      },

      term: {}
    };
  }
}
