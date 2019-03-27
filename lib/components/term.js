/* global Blob,URL,requestAnimationFrame,ResizeObserver */
import React from 'react';
import {Terminal} from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks';
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat';
import {clipboard} from 'electron';
import * as Color from 'color';
import terms from '../terms';
import processClipboard from '../utils/paste';

Terminal.applyAddon(fit);
Terminal.applyAddon(webLinks);
Terminal.applyAddon(winptyCompat);

// map old hterm constants to xterm.js
const CURSOR_STYLES = {
  BEAM: 'bar',
  UNDERLINE: 'underline',
  BLOCK: 'block'
};

const isWebgl2Supported = (() => {
  let isSupported = window.WebGL2RenderingContext ? undefined : false;
  return () => {
    if (isSupported === undefined) {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2', {depth: false, antialias: false});
      isSupported = gl instanceof window.WebGL2RenderingContext;
    }
    return isSupported;
  };
})();

const getTermOptions = props => {
  // Set a background color only if it is opaque
  const needTransparency = Color(props.backgroundColor).alpha() < 1;
  const backgroundColor = needTransparency ? 'transparent' : props.backgroundColor;

  let useWebGL = false;
  if (props.webGLRenderer) {
    if (needTransparency) {
      // eslint-disable-next-line no-console
      console.warn(
        'WebGL Renderer has been disabled since it does not support transparent backgrounds yet. ' +
          'Falling back to canvas-based rendering.'
      );
    } else if (!isWebgl2Supported()) {
      // eslint-disable-next-line no-console
      console.warn('WebGL2 is not supported on your machine. Falling back to canvas-based rendering.');
    } else {
      useWebGL = true;
    }
  }
  Term.reportRenderer(props.uid, useWebGL ? 'WebGL' : 'Canvas');

  return {
    macOptionIsMeta: props.modifierKeys.altIsMeta,
    scrollback: props.scrollback,
    cursorStyle: CURSOR_STYLES[props.cursorShape],
    cursorBlink: props.cursorBlink,
    fontFamily: props.fontFamily,
    fontSize: props.fontSize,
    fontWeight: props.fontWeight,
    fontWeightBold: props.fontWeightBold,
    lineHeight: props.lineHeight,
    letterSpacing: props.letterSpacing,
    allowTransparency: needTransparency,
    macOptionClickForcesSelection: props.macOptionSelectionMode === 'force',
    // HACK: Terminal.setOption breaks if we don't apply these in this order
    // TODO: The above notice can be removed once this is addressed:
    // https://github.com/xtermjs/xterm.js/pull/1790#issuecomment-450000121
    rendererType: useWebGL ? 'webgl' : 'canvas',
    experimentalCharAtlas: useWebGL ? 'webgl' : 'dynamic',
    theme: {
      foreground: props.foregroundColor,
      background: backgroundColor,
      cursor: props.cursorColor,
      cursorAccent: props.cursorAccentColor,
      selection: props.selectionColor,
      black: props.colors.black,
      red: props.colors.red,
      green: props.colors.green,
      yellow: props.colors.yellow,
      blue: props.colors.blue,
      magenta: props.colors.magenta,
      cyan: props.colors.cyan,
      white: props.colors.white,
      brightBlack: props.colors.lightBlack,
      brightRed: props.colors.lightRed,
      brightGreen: props.colors.lightGreen,
      brightYellow: props.colors.lightYellow,
      brightBlue: props.colors.lightBlue,
      brightMagenta: props.colors.lightMagenta,
      brightCyan: props.colors.lightCyan,
      brightWhite: props.colors.lightWhite
    }
  };
};

export default class Term extends React.PureComponent {
  constructor(props) {
    super(props);
    props.ref_(props.uid, this);
    this.termRef = null;
    this.termWrapperRef = null;
    this.termRect = null;
    this.onWindowPaste = this.onWindowPaste.bind(this);
    this.onTermWrapperRef = this.onTermWrapperRef.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.termOptions = {};
    this.disposableListeners = [];
  }

  // The main process shows this in the About dialog
  static reportRenderer(uid, type) {
    const rendererTypes = Term.rendererTypes || {};
    if (rendererTypes[uid] !== type) {
      rendererTypes[uid] = type;
      Term.rendererTypes = rendererTypes;
      window.rpc.emit('info renderer', {uid, type});
    }
  }

  componentDidMount() {
    const {props} = this;

    this.termOptions = getTermOptions(props);
    this.term = props.term || new Terminal(this.termOptions);

    // The parent element for the terminal is attached and removed manually so
    // that we can preserve it across mounts and unmounts of the component
    this.termRef = props.term ? props.term._core._parent : document.createElement('div');
    this.termRef.className = 'term_fit term_term';

    this.termWrapperRef.appendChild(this.termRef);

    if (!props.term) {
      this.term.attachCustomKeyEventHandler(this.keyboardHandler);
      this.term.open(this.termRef);
      this.term.webLinksInit();
      this.term.winptyCompatInit();
    }

    if (this.props.isTermActive) {
      this.term.focus();
    }

    if (props.onTitle) {
      this.disposableListeners.push(this.term.addDisposableListener('title', props.onTitle));
    }

    if (props.onActive) {
      this.disposableListeners.push(this.term.addDisposableListener('focus', props.onActive));
    }

    if (props.onData) {
      this.disposableListeners.push(this.term.addDisposableListener('data', props.onData));
    }

    if (props.onResize) {
      this.disposableListeners.push(
        this.term.addDisposableListener('resize', ({cols, rows}) => {
          props.onResize(cols, rows);
        })
      );
    }

    if (props.onCursorMove) {
      this.disposableListeners.push(
        this.term.addDisposableListener('cursormove', () => {
          const cursorFrame = {
            x: this.term._core.buffer.x * this.term._core.renderer.dimensions.actualCellWidth,
            y: this.term._core.buffer.y * this.term._core.renderer.dimensions.actualCellHeight,
            width: this.term._core.renderer.dimensions.actualCellWidth,
            height: this.term._core.renderer.dimensions.actualCellHeight,
            col: this.term._core.buffer.x,
            row: this.term._core.buffer.y
          };
          props.onCursorMove(cursorFrame);
        })
      );
    }

    window.addEventListener('paste', this.onWindowPaste, {
      capture: true
    });

    terms[this.props.uid] = this;
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

  // intercepting paste event for any necessary processing of
  // clipboard data, if result is falsy, paste event continues
  onWindowPaste(e) {
    if (!this.props.isTermActive) return;

    const processed = processClipboard();
    if (processed) {
      e.preventDefault();
      e.stopPropagation();
      this.term._core.handler(processed);
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

  selectAll() {
    this.term.selectAll();
  }

  fitResize() {
    if (!this.termWrapperRef) {
      return;
    }
    this.term.fit();
  }

  keyboardHandler(e) {
    // Has Mousetrap flagged this event as a command?
    return !e.catched;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.cleared && nextProps.cleared) {
      this.clear();
    }
    const nextTermOptions = getTermOptions(nextProps);

    // Update only options that have changed.
    Object.keys(nextTermOptions)
      .filter(option => option !== 'theme' && nextTermOptions[option] !== this.termOptions[option])
      .forEach(option => {
        try {
          this.term.setOption(option, nextTermOptions[option]);
        } catch (e) {
          if (/The webgl renderer only works with the webgl char atlas/i.test(e.message)) {
            // Ignore this because the char atlas will also be changed
          } else {
            throw e;
          }
        }
      });

    // Do we need to update theme?
    const shouldUpdateTheme =
      !this.termOptions.theme ||
      nextTermOptions.rendererType !== this.termOptions.rendererType ||
      Object.keys(nextTermOptions.theme).some(
        option => nextTermOptions.theme[option] !== this.termOptions.theme[option]
      );
    if (shouldUpdateTheme) {
      this.term.setOption('theme', nextTermOptions.theme);
    }

    this.termOptions = nextTermOptions;

    if (
      this.props.fontSize !== nextProps.fontSize ||
      this.props.fontFamily !== nextProps.fontFamily ||
      this.props.lineHeight !== nextProps.lineHeight ||
      this.props.letterSpacing !== nextProps.letterSpacing
    ) {
      // resize to fit the container
      this.fitResize();
    }

    if (nextProps.rows !== this.props.rows || nextProps.cols !== this.props.cols) {
      this.resize(nextProps.cols, nextProps.rows);
    }
  }

  onTermWrapperRef(component) {
    this.termWrapperRef = component;

    if (component) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeTimeout) {
          return;
        }
        this.resizeTimeout = setTimeout(() => {
          delete this.resizeTimeout;
          this.fitResize();
        }, 0);
      });
      this.resizeObserver.observe(component);
    } else {
      this.resizeObserver.disconnect();
    }
  }

  componentWillUnmount() {
    terms[this.props.uid] = null;
    this.termWrapperRef.removeChild(this.termRef);
    this.props.ref_(this.props.uid, null);

    // to clean up the terminal, we remove the listeners
    // instead of invoking `destroy`, since it will make the
    // term insta un-attachable in the future (which we need
    // to do in case of splitting, see `componentDidMount`
    this.disposableListeners.forEach(handler => handler.dispose());
    this.disposableListeners = [];

    window.removeEventListener('paste', this.onWindowPaste, {
      capture: true
    });
  }

  render() {
    return (
      <div
        className={`term_fit ${this.props.isTermActive ? 'term_active' : ''}`}
        style={{padding: this.props.padding}}
        onMouseUp={this.onMouseUp}
      >
        {this.props.customChildrenBefore}
        <div ref={this.onTermWrapperRef} className="term_fit term_wrapper" />
        {this.props.customChildren}

        <style jsx global>{`
          .term_fit {
            display: block;
            width: 100%;
            height: 100%;
          }

          .term_wrapper {
            /* TODO: decide whether to keep this or not based on understanding what xterm-selection is for */
            overflow: hidden;
          }
        `}</style>
      </div>
    );
  }
}
