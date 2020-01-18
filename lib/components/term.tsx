import React from 'react';
import {Terminal, ITerminalOptions, IDisposable} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {WebLinksAddon} from 'xterm-addon-web-links';
import {SearchAddon} from 'xterm-addon-search';
import {WebglAddon} from 'xterm-addon-webgl';
import {LigaturesAddon} from 'xterm-addon-ligatures';
import {Unicode11Addon} from 'xterm-addon-unicode11';
import {clipboard, shell} from 'electron';
import Color from 'color';
import terms from '../terms';
import processClipboard from '../utils/paste';
import SearchBox from './searchBox';
import ResizeObserver from 'resize-observer-polyfill';
import {TermProps} from '../hyper';
import {ObjectTypedKeys} from '../utils/object';

const isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].includes(navigator.platform);

// map old hterm constants to xterm.js
const CURSOR_STYLES = {
  BEAM: 'bar',
  UNDERLINE: 'underline',
  BLOCK: 'block'
} as const;

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

const getTermOptions = (props: TermProps): ITerminalOptions => {
  // Set a background color only if it is opaque
  const needTransparency = Color(props.backgroundColor).alpha() < 1;
  const backgroundColor = needTransparency ? 'transparent' : props.backgroundColor;

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
    bellStyle: props.bell === 'SOUND' ? 'sound' : 'none',
    windowsMode: isWindows,
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

export default class Term extends React.PureComponent<TermProps> {
  termRef: HTMLElement | null;
  termWrapperRef: HTMLElement | null;
  termOptions: ITerminalOptions;
  disposableListeners: IDisposable[];
  termDefaultBellSound: string | null;
  fitAddon: FitAddon;
  searchAddon: SearchAddon;
  static rendererTypes: Record<string, string>;
  term!: Terminal;
  resizeObserver!: ResizeObserver;
  resizeTimeout!: NodeJS.Timeout;
  constructor(props: TermProps) {
    super(props);
    props.ref_(props.uid, this);
    this.termRef = null;
    this.termWrapperRef = null;
    this.termOptions = {};
    this.disposableListeners = [];
    this.termDefaultBellSound = null;
    this.fitAddon = new FitAddon();
    this.searchAddon = new SearchAddon();
  }

  // The main process shows this in the About dialog
  static reportRenderer(uid: string, type: string) {
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
    this.termDefaultBellSound = this.term.getOption('bellSound');

    // The parent element for the terminal is attached and removed manually so
    // that we can preserve it across mounts and unmounts of the component
    this.termRef = props.term ? props.term.element!.parentElement! : document.createElement('div');
    this.termRef.className = 'term_fit term_term';

    this.termWrapperRef?.appendChild(this.termRef);

    if (!props.term) {
      const needTransparency = Color(props.backgroundColor).alpha() < 1;
      let useWebGL = false;
      if (props.webGLRenderer) {
        if (needTransparency) {
          console.warn(
            'WebGL Renderer has been disabled since it does not support transparent backgrounds yet. ' +
              'Falling back to canvas-based rendering.'
          );
        } else if (!isWebgl2Supported()) {
          console.warn('WebGL2 is not supported on your machine. Falling back to canvas-based rendering.');
        } else {
          // Experimental WebGL renderer needs some more glue-code to make it work on Hyper.
          // If you're working on enabling back WebGL, you will also need to look into `xterm-addon-ligatures` support for that renderer.
          useWebGL = true;
        }
      }
      Term.reportRenderer(props.uid, useWebGL ? 'WebGL' : 'Canvas');

      const shallActivateWebLink = (event: Record<string, any> | undefined) => {
        return event && (!props.webLinksActivationKey || event[`${props.webLinksActivationKey}Key`]);
      };

      this.term.attachCustomKeyEventHandler(this.keyboardHandler);
      this.term.loadAddon(this.fitAddon);
      this.term.loadAddon(this.searchAddon);
      this.term.loadAddon(
        new WebLinksAddon(
          (event: MouseEvent | undefined, uri: string) => {
            if (shallActivateWebLink(event)) shell.openExternal(uri);
          },
          {
            // prevent default electron link handling to allow selection, e.g. via double-click
            willLinkActivate: (event: MouseEvent | undefined) => {
              event?.preventDefault();
              return shallActivateWebLink(event);
            },
            priority: Date.now()
          }
        )
      );
      this.term.open(this.termRef);
      if (useWebGL) {
        this.term.loadAddon(new WebglAddon());
      }
      if (props.disableLigatures !== true) {
        this.term.loadAddon(new LigaturesAddon());
      }
      this.term.loadAddon(new Unicode11Addon());
      this.term.unicode.activeVersion = '11';
    } else {
      // get the cached plugins
      this.fitAddon = props.fitAddon!;
      this.searchAddon = props.searchAddon!;
    }

    this.fitAddon.fit();

    if (this.props.isTermActive) {
      this.term.focus();
    }

    if (props.onTitle) {
      this.disposableListeners.push(this.term.onTitleChange(props.onTitle));
    }

    if (props.onActive) {
      this.term.textarea?.addEventListener('focus', props.onActive);
      this.disposableListeners.push({
        dispose: () => this.term.textarea?.removeEventListener('focus', this.props.onActive)
      });
    }

    if (props.onData) {
      this.disposableListeners.push(this.term.onData(props.onData));
    }

    if (props.onResize) {
      this.disposableListeners.push(
        this.term.onResize(({cols, rows}) => {
          props.onResize(cols, rows);
        })
      );

      // the row and col of init session is null, so reize the node-pty
      props.onResize(this.term.cols, this.term.rows);
    }

    if (props.onCursorMove) {
      this.disposableListeners.push(
        this.term.onCursorMove(() => {
          const cursorFrame = {
            x: this.term.buffer.active.cursorX * (this.term as any)._core._renderService.dimensions.actualCellWidth,
            y: this.term.buffer.active.cursorY * (this.term as any)._core._renderService.dimensions.actualCellHeight,
            width: (this.term as any)._core._renderService.dimensions.actualCellWidth,
            height: (this.term as any)._core._renderService.dimensions.actualCellHeight,
            col: this.term.buffer.active.cursorX,
            row: this.term.buffer.active.cursorY
          };
          props.onCursorMove?.(cursorFrame);
        })
      );
    }

    window.addEventListener('paste', this.onWindowPaste, {
      capture: true
    });

    terms[this.props.uid] = this;
  }

  getTermDocument() {
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
  onWindowPaste = (e: any) => {
    if (!this.props.isTermActive) return;

    const processed = processClipboard();
    if (processed) {
      e.preventDefault();
      e.stopPropagation();
      (this.term as any)._core.handler(processed);
    }
  };

  onMouseUp = (e: React.MouseEvent) => {
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
  };

  write(data: string | Uint8Array) {
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

  search = (searchTerm = '') => {
    this.searchAddon.findNext(searchTerm);
  };

  searchNext = (searchTerm: string) => {
    this.searchAddon.findNext(searchTerm);
  };

  searchPrevious = (searchTerm: string) => {
    this.searchAddon.findPrevious(searchTerm);
  };

  closeSearchBox = () => {
    this.props.toggleSearch();
  };

  resize(cols: number, rows: number) {
    this.term.resize(cols, rows);
  }

  selectAll() {
    this.term.selectAll();
  }

  fitResize() {
    if (!this.termWrapperRef) {
      return;
    }
    this.fitAddon.fit();
  }

  keyboardHandler(e: any) {
    // Has Mousetrap flagged this event as a command?
    return !e.catched;
  }

  componentDidUpdate(prevProps: TermProps) {
    if (!prevProps.cleared && this.props.cleared) {
      this.clear();
    }

    const nextTermOptions = getTermOptions(this.props);

    // Use bellSound in nextProps if it exists
    // otherwise use the default sound found in xterm.
    nextTermOptions.bellSound = this.props.bellSound || this.termDefaultBellSound!;

    if (!prevProps.search && this.props.search) {
      this.search();
    }

    // Update only options that have changed.
    ObjectTypedKeys(nextTermOptions)
      .filter((option) => option !== 'theme' && nextTermOptions[option] !== this.termOptions[option])
      .forEach((option) => {
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
      ObjectTypedKeys(nextTermOptions.theme!).some(
        (option) => nextTermOptions.theme![option] !== this.termOptions.theme![option]
      );
    if (shouldUpdateTheme) {
      this.term.setOption('theme', nextTermOptions.theme);
    }

    this.termOptions = nextTermOptions;

    if (
      this.props.fontSize !== prevProps.fontSize ||
      this.props.fontFamily !== prevProps.fontFamily ||
      this.props.lineHeight !== prevProps.lineHeight ||
      this.props.letterSpacing !== prevProps.letterSpacing
    ) {
      // resize to fit the container
      this.fitResize();
    }

    if (prevProps.rows !== this.props.rows || prevProps.cols !== this.props.cols) {
      this.resize(this.props.cols!, this.props.rows!);
    }
  }

  onTermWrapperRef = (component: HTMLElement | null) => {
    this.termWrapperRef = component;

    if (component) {
      this.resizeObserver = new ResizeObserver(() => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          this.fitResize();
        }, 500);
      });
      this.resizeObserver.observe(component);
    } else {
      this.resizeObserver.disconnect();
    }
  };

  componentWillUnmount() {
    terms[this.props.uid] = null;
    this.termWrapperRef?.removeChild(this.termRef!);
    this.props.ref_(this.props.uid, null);

    // to clean up the terminal, we remove the listeners
    // instead of invoking `destroy`, since it will make the
    // term insta un-attachable in the future (which we need
    // to do in case of splitting, see `componentDidMount`
    this.disposableListeners.forEach((handler) => handler.dispose());
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
        {this.props.search ? (
          <SearchBox
            search={this.search}
            next={this.searchNext}
            prev={this.searchPrevious}
            close={this.closeSearchBox}
          />
        ) : (
          ''
        )}

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
