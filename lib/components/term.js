/* global Blob,URL,requestAnimationFrame */
import React from 'react';
import Terminal from 'xterm';
import {clipboard} from 'electron';
import {PureComponent} from '../base-components';
import terms from '../terms';
import processClipboard from '../utils/paste';

// map old hterm constants to xterm.js
const CURSOR_STYLES = {
  BEAM: 'bar',
  UNDERLINE: 'underline',
  BLOCK: 'block'
};

export default class Term extends PureComponent {
  constructor(props) {
    super(props);
    props.ref_(props.uid, this);
    this.termRef = null;
    this.termWrapperRef = null;
    this.termRect = null;
    this.onOpen = this.onOpen.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onWindowPaste = this.onWindowPaste.bind(this);
    this.onTermRef = this.onTermRef.bind(this);
    this.onTermWrapperRef = this.onTermWrapperRef.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  componentDidMount() {
    const {props} = this;

    // we need to use this hack to retain the term reference
    // as we move the term around splits, until xterm adds
    // support for getState / setState
    if (props.term) {
      this.term = props.term;
      this.termRef.appendChild(this.term.element);
      this.onOpen();
    } else {
      this.term =
        props.term ||
        new Terminal({
          cursorStyle: CURSOR_STYLES[props.cursorShape],
          cursorBlink: props.cursorBlink
        });
      this.term.attachCustomKeyEventHandler(this.keyboardHandler);
      this.term.on('open', this.onOpen);
      this.term.open(this.termRef, {
        focus: false
      });
    }

    if (props.onTitle) {
      this.term.on('title', props.onTitle);
    }

    if (props.onActive) {
      this.term.on('focus', () => {
        // xterm@2 emits this event 2 times. Will be fixed in xterm@3.
        if (!this.props.isTermActive) {
          props.onActive();
        }
      });
    }

    if (props.onData) {
      this.term.on('data', props.onData);
    }

    if (props.onResize) {
      this.term.on('resize', ({cols, rows}) => {
        props.onResize(cols, rows);
      });
    }

    window.addEventListener('resize', this.onWindowResize, {
      passive: true
    });

    window.addEventListener('paste', this.onWindowPaste, {
      capture: true
    });

    terms[this.props.uid] = this;
  }

  onOpen() {
    // we need to delay one frame so that aphrodite styles
    // get applied and we can make an accurate measurement
    // of the container width and height
    requestAnimationFrame(() => {
      // at this point it would make sense for character
      // measurement to have taken place but it seems that
      // xterm.js might be doing this asynchronously, so
      // we force it instead
      this.term.charMeasure.measure();
      this.fitResize();
    });
  }

  getTermDocument() {
    // eslint-disable-next-line no-console
    console.warn(
      'The underlying terminal engine of Hyper no longer ' +
        'uses iframes with individual `document` objects for each ' +
        'terminal instance. This method call is retained for ' +
        "backwards compatibility reasons. It's ok to attach directly" +
        'to the `document` object of the main `window`.'
    );
    return document;
  }

  onWindowResize() {
    this.fitResize();
  }

  // intercepting paste event for any necessary processing of
  // clipboard data, if result is falsy, paste event continues
  onWindowPaste(e) {
    if (!this.props.isTermActive) return;

    const processed = processClipboard();
    if (processed) {
      e.preventDefault();
      e.stopPropagation();
      this.term.send(processed);
    }
  }

  onMouseUp(e) {
    if (this.props.quickEdit && e.button === 2) {
      if (this.term.hasSelection()) {
        clipboard.writeText(this.term.getSelection());
        this.term.clearSelection();
      } else {
        document.execCommand('paste');
      }
    } else if (this.props.copyOnSelect && this.term.hasSelection()) {
      clipboard.writeText(this.term.getSelection());
    }
  }

  write(data) {
    this.term.write(data);
  }

  focus() {
    this.term.focus();
  }

  clear() {
    this.term.clear();
  }

  reset() {
    this.term.reset();
  }

  resize(cols, rows) {
    this.term.resize(cols, rows);
  }

  fitResize() {
    if (!this.termWrapperRef) {
      return;
    }
    const termRect = this.termWrapperRef.getBoundingClientRect();
    const cols = Math.floor(termRect.width / this.term.charMeasure.width);
    const rows = Math.floor(termRect.height / this.term.charMeasure.height);
    this.resize(cols, rows);
  }

  keyboardHandler(e) {
    // Has Mousetrap flagged this event as a command?
    return !e.catched;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.cleared && nextProps.cleared) {
      this.clear();
    }

    if (!this.props.isTermActive && nextProps.isTermActive) {
      requestAnimationFrame(() => {
        this.term.charMeasure.measure();
        this.fitResize();
      });
    }

    if (this.props.fontSize !== nextProps.fontSize || this.props.fontFamily !== nextProps.fontFamily) {
      // invalidate xterm cache about how wide each
      // character is
      this.term.charMeasure.measure();

      // resize to fit the container
      this.fitResize();
    }

    if (nextProps.rows !== this.props.rows || nextProps.cols !== this.props.cols) {
      this.resize(nextProps.cols, nextProps.rows);
    }
  }

  onTermWrapperRef(component) {
    this.termWrapperRef = component;
  }

  onTermRef(component) {
    this.termRef = component;
  }

  componentWillUnmount() {
    terms[this.props.uid] = null;
    this.props.ref_(this.props.uid, null);

    // to clean up the terminal, we remove the listeners
    // instead of invoking `destroy`, since it will make the
    // term insta un-attachable in the future (which we need
    // to do in case of splitting, see `componentDidMount`
    this.term._events = {};

    window.removeEventListener('resize', this.onWindowResize, {
      passive: true
    });

    window.removeEventListener('paste', this.onWindowPaste, {
      capture: true
    });
  }

  template(css) {
    return (
      <div
        className={css('fit', this.props.isTermActive && 'active')}
        style={{padding: this.props.padding}}
        onMouseUp={this.onMouseUp}
      >
        {this.props.customChildrenBefore}
        <div ref={this.onTermWrapperRef} className={css('fit', 'wrapper')}>
          <div ref={this.onTermRef} className={css('term')} />
        </div>
        {this.props.customChildren}
      </div>
    );
  }

  styles() {
    return {
      fit: {
        display: 'block',
        width: '100%',
        height: '100%'
      },
      wrapper: {
        // TODO: decide whether to keep this or not based on
        // understanding what xterm-selection is for
        overflow: 'hidden'
      },
      term: {}
    };
  }
}
