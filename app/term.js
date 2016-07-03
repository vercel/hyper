/*global URL:false,Blob:false*/
import React, { Component } from 'react';
import { hterm, lib as htermLib } from 'hterm-umd';

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

export default class Term extends Component {

  componentDidMount () {
    this.term = new hterm.Terminal();
    this.term.prefs_.set('font-family', 'Menlo');
    this.term.prefs_.set('font-size', 11);
    this.term.prefs_.set('cursor-color', '#F81CE5');
    this.term.prefs_.set('enable-clipboard-notice', false);

    this.term.prefs_.set('user-css', URL.createObjectURL(new Blob([`
      .cursor-node[focus="false"] {
        border-width: 1px !important;
      }
    `]), { type: 'text/css' }));

    this.term.onTerminalReady = () => {
      const io = this.term.io.push();
      io.onVTKeystroke = io.sendString = (str) => {
        console.log('handle', str);
        this.props.onData(str);
      };
      io.onTerminalResize = (cols, rows) => {
        this.props.onResize({ cols, rows });
      };
    };
    this.term.decorate(this.refs.term);
  }

  getTermDocument () {
    return this.term.document_;
  }

  shouldComponentUpdate (nextProps) {
    if (this.props.url !== nextProps.url) {
      // when the url prop changes, we make sure
      // the terminal starts or stops ignoring
      // key input so that it doesn't conflict
      // with the <webview>
      if (nextProps.url) {
        this.term.io.push();
      } else {
        this.term.io.pop();
      }
      return true;
    }

    return false;
  }

  write (data) {
    const match = data.match(/bash: ((https?:\/\/)|(\/\/))?(.*): ((command not found)|(No such file or directory))/);
    if (match) {
      const url = match[4];
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
    this.term.scrollPort_.focus();
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
