/* global Blob,URL,requestAnimationFrame */
import React from 'react';
import Color from 'color';
import hterm from '../hterm';
import Component from '../component';
import { getColorList } from '../utils/colors';
import notify from '../utils/notify';

export default class Term extends Component {

  constructor (props) {
    super(props);
    this.onWheel = this.onWheel.bind(this);
    this.onScrollEnter = this.onScrollEnter.bind(this);
    this.onScrollLeave = this.onScrollLeave.bind(this);
    props.ref_(this);
  }

  componentDidMount () {
    const { props } = this;
    this.term = new hterm.Terminal();

    // the first term that's created has unknown size
    // subsequent new tabs have size
    if (props.cols && props.rows) {
      this.term.realizeSize_(props.cols, props.rows);
    }

    this.term.prefs_.set('font-family', props.fontFamily);
    this.term.prefs_.set('font-size', props.fontSize);
    this.term.prefs_.set('font-smoothing', props.fontSmoothing);
    this.term.prefs_.set('cursor-color', this.validateColor(props.cursorColor, 'rgba(255,255,255,0.5)'));
    this.term.prefs_.set('enable-clipboard-notice', false);
    this.term.prefs_.set('foreground-color', props.foregroundColor);
    this.term.prefs_.set('background-color', 'transparent');
    this.term.prefs_.set('color-palette-overrides', getColorList(props.colors));
    this.term.prefs_.set('user-css', this.getStylesheet(props.customCSS));
    this.term.prefs_.set('scrollbar-visible', false);
    this.term.prefs_.set('receive-encoding', 'raw');
    this.term.prefs_.set('send-encoding', 'raw');
    this.term.prefs_.set('alt-sends-what', 'browser-key');

    if (props.bell === 'SOUND') {
      this.term.prefs_.set('audible-bell-sound', this.props.bellSoundURL);
    } else {
      this.term.prefs_.set('audible-bell-sound', '');
    }

    if (props.copyOnSelect) {
      this.term.prefs_.set('copy-on-select', true);
    } else {
      this.term.prefs_.set('copy-on-select', false);
    }

    this.term.onTerminalReady = () => {
      const io = this.term.io.push();
      io.onVTKeystroke = io.sendString = props.onData;
      io.onTerminalResize = (cols, rows) => {
        if (cols !== this.props.cols || rows !== this.props.rows) {
          props.onResize(cols, rows);
        }
      };

      // this.term.CursorNode_ is available at this point.
      this.term.setCursorShape(props.cursorShape);
    };
    this.term.decorate(this.refs.term);
    this.term.installKeyboard();
    if (this.props.onTerminal) this.props.onTerminal(this.term);

    const iframeWindow = this.getTermDocument().defaultView;
    iframeWindow.addEventListener('wheel', this.onWheel);
  }

  onWheel (e) {
    if (this.props.onWheel) {
      this.props.onWheel(e);
    }
    this.term.prefs_.set('scrollbar-visible', true);
    clearTimeout(this.scrollbarsHideTimer);
    if (!this.scrollMouseEnter) {
      this.scrollbarsHideTimer = setTimeout(() => {
        this.term.prefs_.set('scrollbar-visible', false);
      }, 1000);
    }
  }

  onScrollEnter () {
    clearTimeout(this.scrollbarsHideTimer);
    this.term.prefs_.set('scrollbar-visible', true);
    this.scrollMouseEnter = true;
  }

  onScrollLeave () {
    this.term.prefs_.set('scrollbar-visible', false);
    this.scrollMouseEnter = false;
  }

  write (data) {
    requestAnimationFrame(() => {
      this.term.io.writeUTF8(data);
    });
  }

  focus () {
    this.term.focus();
  }

  clear () {
    this.term.clearPreserveCursorRow();

    // If cursor is still not at the top, a command is probably
    // running and we'd like to delete the whole screen.
    // Move cursor to top
    if (this.term.getCursorRow() !== 0) {
      this.term.io.writeUTF8('\x1B[0;0H\x1B[2J');
    }
  }

  moveWordLeft () {
    this.term.onVTKeystroke('\x1bb');
  }

  moveWordRight () {
    this.term.onVTKeystroke('\x1bf');
  }

  deleteWordLeft () {
    this.term.onVTKeystroke('\x1b\x7f');
  }

  deleteWordRight () {
    this.term.onVTKeystroke('\x1bd');
  }

  deleteLine () {
    this.term.onVTKeystroke('\x1bw');
  }

  moveToStart () {
    this.term.onVTKeystroke('\x01');
  }

  moveToEnd () {
    this.term.onVTKeystroke('\x05');
  }

  selectAll () {
    this.term.selectAll();
  }

  getTermDocument () {
    return this.term.document_;
  }

  getStylesheet (css) {
    const blob = new Blob([`
      .cursor-node[focus="false"] {
        border-width: 1px !important;
      }
      ${css}
    `], { type: 'text/css' });
    return URL.createObjectURL(blob);
  }

  validateColor (color, alternative = 'rgb(255,255,255)') {
    try {
      return Color(color).rgbString();
    } catch (err) {
      notify(`color "${color}" is invalid`);
    }
    return alternative;
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.url !== nextProps.url) {
      // when the url prop changes, we make sure
      // the terminal starts or stops ignoring
      // key input so that it doesn't conflict
      // with the <webview>
      if (nextProps.url) {
        const io = this.term.io.push();
        io.onVTKeystroke = io.sendString = (str) => {
          if (1 === str.length && 3 === str.charCodeAt(0) /* Ctrl + C */) {
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

    if (this.props.fontSize !== nextProps.fontSize) {
      this.term.prefs_.set('font-size', nextProps.fontSize);
    }

    if (this.props.foregroundColor !== nextProps.foregroundColor) {
      this.term.prefs_.set('foreground-color', nextProps.foregroundColor);
    }

    if (this.props.fontFamily !== nextProps.fontFamily) {
      this.term.prefs_.set('font-family', nextProps.fontFamily);
    }

    if (this.props.fontSmoothing !== nextProps.fontSmoothing) {
      this.term.prefs_.set('font-smoothing', nextProps.fontSmoothing);
    }

    if (this.props.cursorColor !== nextProps.cursorColor) {
      this.term.prefs_.set('cursor-color', this.validateColor(nextProps.cursorColor, 'rgba(255,255,255,0.5)'));
    }

    if (this.props.cursorShape !== nextProps.cursorShape) {
      this.term.setCursorShape(nextProps.cursorShape);
    }

    if (this.props.colors !== nextProps.colors) {
      this.term.prefs_.set('color-palette-overrides', getColorList(nextProps.colors));
    }

    if (this.props.customCSS !== nextProps.customCSS) {
      this.term.prefs_.set('user-css', this.getStylesheet(nextProps.customCSS));
    }

    if (this.props.bell === 'SOUND') {
      this.term.prefs_.set('audible-bell-sound', this.props.bellSoundURL);
    } else {
      this.term.prefs_.set('audible-bell-sound', '');
    }

    if (this.props.copyOnSelect) {
      this.term.prefs_.set('copy-on-select', true);
    } else {
      this.term.prefs_.set('copy-on-select', false);
    }
  }

  componentWillUnmount () {
    clearTimeout(this.scrollbarsHideTimer);
    this.props.ref_(null);
  }

  template (css) {
    return <div className={ css('fit') }>
      { this.props.customChildrenBefore }
      <div ref='term' className={ css('fit', 'term') } />
      { this.props.url
        ? <webview
            src={this.props.url}
            style={{
              background: '#000',
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'inline-flex',
              width: '100%',
              height: '100%'
            }}></webview>
        : <div
            className={ css('scrollbarShim') }
            onMouseEnter={ this.onScrollEnter }
            onMouseLeave={ this.onScrollLeave } />
      }
      { this.props.customChildren }
    </div>;
  }

  styles () {
    return {
      fit: {
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
