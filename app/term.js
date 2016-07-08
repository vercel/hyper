/*global URL:false,Blob:false*/
import React, { Component } from 'react';
import { hterm, lib as htermLib } from './hterm';
import * as regex from './regex';

export default class Term extends Component {

  componentDidMount () {
    const { props } = this;
    this.term = new hterm.Terminal();

    // the first term that's created has unknown size
    // subsequent new tabs have size
    if (props.cols) {
      this.term.realizeSize_(props.cols, props.rows);
    }

    this.term.prefs_.set('font-family', props.fontFamily);
    this.term.prefs_.set('font-size', props.fontSize);
    this.term.prefs_.set('cursor-color', props.cursorColor);
    this.term.prefs_.set('enable-clipboard-notice', false);
    this.term.prefs_.set('background-color', props.backgroundColor);
    this.term.prefs_.set('color-palette-overrides', props.colors);

    this.term.prefs_.set('user-css', URL.createObjectURL(new Blob([`
      .cursor-node[focus="false"] {
        border-width: 1px !important;
      }
      ${Array.from(props.customCSS || '').join('\n')}
    `]), { type: 'text/css' }));

    this.term.onTerminalReady = () => {
      const io = this.term.io.push();
      io.onVTKeystroke = io.sendString = (str) => {
        props.onData(str);
      };
      io.onTerminalResize = (cols, rows) => {
        props.onResize({ cols, rows });
      };
    };
    this.term.decorate(this.refs.term);
    this.term.installKeyboard();
  }

  getTermDocument () {
    return this.term.document_;
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.fontSize !== nextProps.fontSize) {
      this.term.prefs_.set('font-size', nextProps.fontSize);
    }

    if (this.props.backgroundColor !== nextProps.backgroundColor) {
      this.term.prefs_.set('background-color', nextProps.backgroundColor);
    }

    if (this.props.fontFamily !== nextProps.fontFamily) {
      this.term.prefs_.set('font-family', nextProps.fontFamily);
    }

    if (this.props.cursorColor !== nextProps.cursorColor) {
      this.term.prefs_.set('cursor-color', nextProps.cursorColor);
    }

    if (this.props.colors.toString() !== nextProps.colors.toString()) {
      this.term.prefs_.set('color-palette-overrides', nextProps.colors);
    }
  }

  shouldComponentUpdate (nextProps) {
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
      return true;
    }

    return false;
  }

  write (data) {
    let match = data.match(regex.bash);
    let url;

    if (match) {
      url = match[5];
    } else {
      match = data.match(regex.zsh);
      if (match) {
        url = match[7];
      } else {
        match = data.match(regex.fish);
        if (match) {
          url = match[4];
        }
      }
    }

    if (url) {
      // extract the domain portion from the url
      const domain = url.split('/')[0];
      if (regex.domain.test(domain)) {
        this.props.onURL(toURL(url));
        return;
      }
    }

    this.term.io.print(data);
  }

  focus () {
    this.term.focus();
  }

  clear () {
    const { term } = this;

    // we re-implement `wipeContents` to preserve the line
    // and cursor position that the client is in.
    // otherwise the user ends up with a completely clear
    // screen which is really strange
    term.scrollbackRows_.length = 0;
    term.scrollPort_.resetCache();

    [term.primaryScreen_, term.alternateScreen_].forEach(function (screen) {
      const bottom = screen.getHeight();
      if (bottom > 0) {
        term.renumberRows_(0, bottom);

        const x = screen.cursorPosition.column;
        const y = screen.cursorPosition.row;

        if (x === 0) {
          // Empty screen, nothing to do.
          return;
        }

        // here we move the row that the user was focused on
        // to the top of the screen
        term.moveRows_(y, 1, 0);

        for (let i = 1; i < bottom; i++) {
          screen.setCursorPosition(i, 0);
          screen.clearCursorRow();
        }

        // we restore the cursor position
        screen.setCursorPosition(0, x);
      }
    });

    term.syncCursorPosition_();
    term.scrollPort_.invalidate();

    // this will avoid a bug where the `wipeContents`
    // hterm API doens't send the scroll to the top
    this.term.scrollPort_.redraw_();
  }

  componentWillUnmount () {
    // there's no need to manually destroy
    // as all the events are attached to the iframe
    // which gets removed
  }

  render () {
    return <div style={{ width: '100%', height: '100%' }}>
      <div ref='term' style={{ position: 'relative', width: '100%', height: '100%' }} />
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
        : null
      }
    </div>;
  }

}

function toURL (domain) {
  if (/^https?:\/\//.test(domain)) {
    return domain;
  }

  if ('//' === domain.substr(0, 2)) {
    return domain;
  }

  return 'http://' + domain;
}
