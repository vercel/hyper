/* global Blob,URL,requestAnimationFrame */
import React from 'react';
import Component from '../component';
import terms from '../terms';
import Terminal from 'hyper-xterm-tmp';

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
    this.termWrapperRef = null
    this.termRect = null
    this.onOpen = this.onOpen.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
  }

  componentDidMount() {
    const {props} = this;

    // we need to use this hack to retain the term reference
    // as we move the term around splits, until xterm adds
    // support for getState / setState
    if (props.term) {
      this.term = props.term
      this.termRef.appendChild(this.term.element)
      this.onOpen()
    } else {
      this.term = props.term || new Terminal({
        cursorStyle: CURSOR_STYLES[props.cursorShape],
        cursorBlink: props.cursorBlink
      });
      this.term.on('open', this.onOpen)
      this.term.open(this.termRef, {
        focus: false
      })
    }

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

    window.addEventListener('resize', this.onWindowResize, {
      passive: true
    })

    terms[this.props.uid] = this;
  }

  onOpen () {
    // we need to delay one frame so that aphrodite styles
    // get applied and we can make an accurate measurement
    // of the container width and height
    requestAnimationFrame(() => {
      // at this point it would make sense for character
      // measurement to have taken place but it seems that
      // xterm.js might be doing this asynchronously, so
      // we force it instead
      this.term.charMeasure.measure();
      this.measureResize();
    })
  }

  getTermDocument () {
    // eslint-disable-next-line no-console
    console.error('unimplemented')
  }

  // measures the container and makes the decision
  // whether to resize the term to fit the container
  measureResize () {
    console.log('performing measure resize')
    const termRect = this.termWrapperRef.getBoundingClientRect()

    if (!this.termRect ||
      termRect.width !== this.termRect.width ||
      termRect.height !== this.termRect.height) {
      this.termRect = termRect;
      console.log('performing fit resize')
      this.fitResize()
    }
  }

  onWindowResize() {
    this.measureResize();
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

  reset () {
    this.term.reset();
  }

  resize (cols, rows) {
    this.term.resize(cols, rows);
  }

  fitResize () {
    const cols = Math.floor(
      this.termRect.width / this.term.charMeasure.width
    )
    const rows = Math.floor(
      this.termRect.height / this.term.charMeasure.height
    )

    if (cols !== this.props.cols || rows !== this.props.rows) {
      this.resize(cols, rows)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.cleared && nextProps.cleared) {
      this.clear();
    }

    if (this.props.fontSize !== nextProps.fontSize ||
        this.props.fontFamily !== nextProps.fontFamily) {
      // invalidate xterm cache about how wide each
      // character is
      this.term.charMeasure.measure()

      // resize to fit the container
      this.fitResize()
    }

    if (nextProps.rows !== this.props.rows ||
        nextProps.cols !== this.props.cols) {
      this.resize(nextProps.cols, nextProps.rows)
    }
  }

  componentWillUnmount() {
    terms[this.props.uid] = this;
    this.props.ref_(null);

    // to clean up the terminal, we remove the listeners
    // instead of invoking `destroy`, since it will make the 
    // term insta un-attachable in the future (which we need
    // to do in case of splitting, see `componentDidMount`
    this.term._events = {}

    window.removeEventListener('resize', this.onWindowResize, {
      passive: true
    })
  }

  template(css) {
    return (<div
      className={css('fit', this.props.isTermActive && 'active')}
      style={{padding: this.props.padding}}
      >
      { this.props.customChildrenBefore }
      <div
        ref={component => {
          this.termWrapperRef = component;
        }}
        className={css('fit', 'wrapper')}
      >
        <div
          ref={component => {
            this.termRef = component;
          }}
          className={css('term')}
          />
      </div>
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
      wrapper: {
        // TODO: decide whether to keep this or not based on
        // understanding what xterm-selection is for
        overflow: 'hidden'
      },
      term: {}
    };
  }
}
