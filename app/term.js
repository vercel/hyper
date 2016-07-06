/*global URL:false,Blob:false*/
import React, { Component } from 'react';
import { hterm, lib as htermLib } from 'hterm-umdjs';
import colors from './colors';

hterm.defaultStorage = new htermLib.Storage.Memory();

// override double click behavior to copy
const oldMouse = hterm.Terminal.prototype.onMouse_;
hterm.Terminal.prototype.onMouse_ = function (e) {
  if ('dblclick' === e.type) {
    console.log('[hyperterm+hterm] ignore double click');
    return;
  }
  return oldMouse.call(this, e);
};

// there's no option to turn off the size overlay
hterm.Terminal.prototype.overlaySize = function () {};

// fixing a bug in hterm where a double click triggers
// a non-collapsed selection whose text is '', and results
// in an infinite copy loop
hterm.Terminal.prototype.copySelectionToClipboard = function () {
  var text = this.getSelectionText();
  if (text != null && text !== '') {
    this.copyStringToClipboard(text);
  }
};

// passthrough all the commands that are meant to control
// hyperterm and not the terminal itself
const oldKeyDown = hterm.Keyboard.prototype.onKeyDown_;
hterm.Keyboard.prototype.onKeyDown_ = function (e) {
  if (e.metaKey) {
    return;
  }
  return oldKeyDown.call(this, e);
};

const oldKeyPress = hterm.Keyboard.prototype.onKeyPress_;
hterm.Keyboard.prototype.onKeyPress_ = function (e) {
  if (e.metaKey) {
    return;
  }
  return oldKeyPress.call(this, e);
};

const domainRegex = /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/;
const bashRegex = /(ba)?sh: ((https?:\/\/)|(\/\/))?(.*): ((command not found)|(No such file or directory))/;
const zshRegex = /zsh: ((command not found)|(no such file or directory)): ((https?:\/\/)|(\/\/))?([^\n]+)/;
const fishRegex = /fish: Unknown command '((https?:\/\/)|(\/\/))?([^']+)'/;

export default class Term extends Component {

  componentDidMount () {
    this.term = new hterm.Terminal();

    // the first term that's created has unknown size
    // subsequent new tabs have size
    if (this.props.cols) {
      this.term.realizeSize_(this.props.cols, this.props.rows);
    }
    this.term.prefs_.set('font-family', "Menlo for Powerline, 'DejaVu Sans Mono', 'Lucida Console', monospace");
    this.term.prefs_.set('font-size', this.props.fontSize);
    this.term.prefs_.set('cursor-color', '#F81CE5');
    this.term.prefs_.set('enable-clipboard-notice', false);
    this.term.prefs_.set('background-color', '#000');
    this.term.prefs_.set('color-palette-overrides', colors);

    this.term.prefs_.set('user-css', URL.createObjectURL(new Blob([`
      .cursor-node[focus="false"] {
        border-width: 1px !important;
      }
    `]), { type: 'text/css' }));

    this.term.onTerminalReady = () => {
      const io = this.term.io.push();
      io.onVTKeystroke = io.sendString = (str) => {
        this.props.onData(str);
      };
      io.onTerminalResize = (cols, rows) => {
        this.props.onResize({ cols, rows });
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
    let match = data.match(bashRegex);
    let url;

    if (match) {
      url = match[5];
    } else {
      match = data.match(zshRegex);
      if (match) {
        url = match[7];
      } else {
        match = data.match(fishRegex);
        if (match) {
          url = match[4];
        }
      }
    }

    if (url) {
      // extract the domain portion from the url
      const domain = url.split('/')[0];
      if (domainRegex.test(domain)) {
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
