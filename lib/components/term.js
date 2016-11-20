/* global Blob,URL,requestAnimationFrame */
import React from 'react';
import Color from 'color';
import uuid from 'uuid';
import hterm from '../hterm';
import Component from '../component';
import getColorList from '../utils/colors';
import notify from '../utils/notify';

export default class Term extends Component {

  constructor(props) {
    super(props);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleScrollEnter = this.handleScrollEnter.bind(this);
    this.handleScrollLeave = this.handleScrollLeave.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.onHyperCaret = this.onHyperCaret.bind(this);
    props.ref_(this);
  }

  componentDidMount() {
    const {props} = this;
    this.term = props.term || new hterm.Terminal(uuid.v4());
    this.term.onHyperCaret(this.hyperCaret);

    // the first term that's created has unknown size
    // subsequent new tabs have size
    if (props.cols && props.rows) {
      this.term.realizeSize_(props.cols, props.rows);
    }

    const prefs = this.term.getPrefs();

    prefs.set('font-family', props.fontFamily);
    prefs.set('font-size', props.fontSize);
    prefs.set('font-smoothing', props.fontSmoothing);
    prefs.set('cursor-color', this.validateColor(props.cursorColor, 'rgba(255,255,255,0.5)'));
    prefs.set('enable-clipboard-notice', false);
    prefs.set('foreground-color', props.foregroundColor);

    // hterm.ScrollPort.prototype.setBackgroundColor is overriden
    // to make hterm's background transparent. we still need to set
    // background-color for proper text rendering
    prefs.set('background-color', props.backgroundColor);
    prefs.set('color-palette-overrides', getColorList(props.colors));
    prefs.set('user-css', this.getStylesheet(props.customCSS));
    prefs.set('scrollbar-visible', false);
    prefs.set('receive-encoding', 'raw');
    prefs.set('send-encoding', 'raw');
    prefs.set('alt-sends-what', 'browser-key');

    if (props.bell === 'SOUND') {
      prefs.set('audible-bell-sound', this.props.bellSoundURL);
    } else {
      prefs.set('audible-bell-sound', '');
    }

    if (props.copyOnSelect) {
      prefs.set('copy-on-select', true);
    } else {
      prefs.set('copy-on-select', false);
    }

    this.term.onTerminalReady = () => {
      const io = this.term.io.push();
      io.onVTKeystroke = io.sendString = props.onData;
      io.onTerminalResize = (cols, rows) => {
        if (cols !== this.props.cols || rows !== this.props.rows) {
          props.onResize(cols, rows);
        }
      };

      this.term.modifierKeys = props.modifierKeys;
      // this.term.CursorNode_ is available at this point.
      this.term.setCursorShape(props.cursorShape);

      // emit onTitle event when hterm instance
      // wants to set the title of its tab
      this.term.setWindowTitle = props.onTitle;
      this.term.focusHyperCaret();
    };
    this.term.decorate(this.termRef);
    this.term.installKeyboard();
    if (this.props.onTerminal) {
      this.props.onTerminal(this.term);
    }

    const iframeWindow = this.getTermDocument().defaultView;
    iframeWindow.addEventListener('wheel', this.handleWheel);

    this.getScreenNode().addEventListener('mouseup', this.handleMouseUp);
  }

  handleWheel(e) {
    if (this.props.onWheel) {
      this.props.onWheel(e);
    }
    const prefs = this.term.getPrefs();
    prefs.set('scrollbar-visible', true);
    clearTimeout(this.scrollbarsHideTimer);
    if (!this.scrollMouseEnter) {
      this.scrollbarsHideTimer = setTimeout(() => {
        prefs.set('scrollbar-visible', false);
      }, 1000);
    }
  }

  handleScrollEnter() {
    clearTimeout(this.scrollbarsHideTimer);
    const prefs = this.term.getPrefs();
    prefs.set('scrollbar-visible', true);
    this.scrollMouseEnter = true;
  }

  handleScrollLeave() {
    const prefs = this.term.getPrefs();
    prefs.set('scrollbar-visible', false);
    this.scrollMouseEnter = false;
  }

  handleFocus() {
    // This will in turn result in `this.focus()` being
    // called, which is unecessary.
    // Should investigate if it matters.
    this.props.onActive();
    this.term.focusHyperCaret();
  }

  handleMouseUp() {
    this.props.onActive();
    // this makes sure that we focus the hyper caret only
    // if a click on the term does not result in a selection
    // otherwise, if we focus without such check, it'd be
    // impossible to select a piece of text
    if (this.term.document_.getSelection().type !== 'Range') {
      this.term.focusHyperCaret();
    }
  }

  onHyperCaret(caret) {
    this.hyperCaret = caret;
  }

  write(data) {
    this.term.io.writeUTF8(data);
  }

  focus() {
    this.term.focusHyperCaret();
  }

  clear() {
    this.term.clearPreserveCursorRow();

    // If cursor is still not at the top, a command is probably
    // running and we'd like to delete the whole screen.
    // Move cursor to top
    if (this.term.getCursorRow() !== 0) {
      this.term.io.writeUTF8('\x1B[0;0H\x1B[2J');
    }
  }

  moveWordLeft() {
    this.term.onVTKeystroke('\x1bb');
  }

  moveWordRight() {
    this.term.onVTKeystroke('\x1bf');
  }

  deleteWordLeft() {
    this.term.onVTKeystroke('\x1b\x7f');
  }

  deleteWordRight() {
    this.term.onVTKeystroke('\x1bd');
  }

  deleteLine() {
    this.term.onVTKeystroke('\x1bw');
  }

  moveToStart() {
    this.term.onVTKeystroke('\x01');
  }

  moveToEnd() {
    this.term.onVTKeystroke('\x05');
  }

  selectAll() {
    this.term.selectAll();
  }

  getScreenNode() {
    return this.term.scrollPort_.getScreenNode();
  }

  getTermDocument() {
    return this.term.document_;
  }

  getStylesheet(css) {
    const hyperCaret = `
      .hyper-caret {
        outline: none;
        display: inline-block;
        color: transparent;
        text-shadow: 0 0 0 black;
        font-family: ${this.props.fontFamily};
        font-size: ${this.props.fontSize}px;
      }
    `;
    const osSpecificCss = process.platform === 'win32' ?
      `::-webkit-scrollbar {
            width: 5px;
          }
          ::-webkit-scrollbar-thumb {
            -webkit-border-radius: 10px;
            border-radius: 10px;
            background: ${this.props.borderColor};
          }
          ::-webkit-scrollbar-thumb:window-inactive {
            background: ${this.props.borderColor};
          }` : ''
    ;
    return URL.createObjectURL(new Blob([`
      .cursor-node[focus="false"] {
         border-width: 1px !important;
      }
      ${hyperCaret}
      ${osSpecificCss}
      ${css}
    `], {type: 'text/css'}));
  }

  validateColor(color, alternative = 'rgb(255,255,255)') {
    try {
      return Color(color).rgbString();
    } catch (err) {
      notify(`color "${color}" is invalid`);
    }
    return alternative;
  }

  handleMouseDown(ev) {
    // we prevent losing focus when clicking the boundary
    // wrappers of the main terminal element
    if (ev.target === this.termWrapperRef ||
        ev.target === this.termRef) {
      ev.preventDefault();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      // when the url prop changes, we make sure
      // the terminal starts or stops ignoring
      // key input so that it doesn't conflict
      // with the <webview>
      if (nextProps.url) {
        const io = this.term.io.push();
        io.onVTKeystroke = io.sendString = str => {
          if (str.length === 1 && str.charCodeAt(0) === 3 /* Ctrl + C */) {
            this.props.onURLAbort();
          }
        };
      } else {
        this.term.io.pop();
      }
    }

    if (!this.props.cleared && nextProps.cleared) {
      this.clear();
    }

    const prefs = this.term.getPrefs();

    if (this.props.fontSize !== nextProps.fontSize) {
      prefs.set('font-size', nextProps.fontSize);
      this.hyperCaret.style.fontSize = nextProps.fontSize + 'px';
    }

    if (this.props.foregroundColor !== nextProps.foregroundColor) {
      prefs.set('foreground-color', nextProps.foregroundColor);
    }

    if (this.props.fontFamily !== nextProps.fontFamily) {
      prefs.set('font-family', nextProps.fontFamily);
      this.hyperCaret.style.fontFamily = nextProps.fontFamily;
    }

    if (this.props.fontSmoothing !== nextProps.fontSmoothing) {
      prefs.set('font-smoothing', nextProps.fontSmoothing);
    }

    if (this.props.cursorColor !== nextProps.cursorColor) {
      prefs.set('cursor-color', this.validateColor(nextProps.cursorColor, 'rgba(255,255,255,0.5)'));
    }

    if (this.props.cursorShape !== nextProps.cursorShape) {
      this.term.setCursorShape(nextProps.cursorShape);
    }

    if (this.props.colors !== nextProps.colors) {
      prefs.set('color-palette-overrides', getColorList(nextProps.colors));
    }

    if (this.props.customCSS !== nextProps.customCSS) {
      prefs.set('user-css', this.getStylesheet(nextProps.customCSS));
    }

    if (this.props.bell === 'SOUND') {
      prefs.set('audible-bell-sound', this.props.bellSoundURL);
    } else {
      prefs.set('audible-bell-sound', '');
    }

    if (this.props.copyOnSelect) {
      prefs.set('copy-on-select', true);
    } else {
      prefs.set('copy-on-select', false);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.scrollbarsHideTimer);
    this.props.ref_(null);
  }

  template(css) {
    return (<div
      ref={component => {
        this.termWrapperRef = component;
      }}
      className={css('fit', this.props.isTermActive && 'active')}
      onMouseDown={this.handleMouseDown}
      style={{padding: this.props.padding}}
      >
      { this.props.customChildrenBefore }
      <div
        ref={component => {
          this.termRef = component;
        }}
        className={css('fit', 'term')}
        />
      { this.props.url ?
        <webview
          src={this.props.url}
          onFocus={this.handleFocus}
          style={{
            background: '#fff',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'inline-flex',
            width: '100%',
            height: '100%'
          }}
          /> :
        [
          <div key="hyper-caret" contentEditable className="hyper-caret" ref={this.onHyperCaret}/>,
          <div // eslint-disable-line react/jsx-indent
            key="scrollbar"
            className={css('scrollbarShim')}
            onMouseEnter={this.handleScrollEnter}
            onMouseLeave={this.handleScrollLeave}
            />
        ]
      }
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

      term: {
        position: 'relative'
      },

      scrollbarShim: {
        position: 'fixed',
        right: 0,
        width: '50px',
        top: 0,
        bottom: 0,
        pointerEvents: 'none'
      }
    };
  }
}
