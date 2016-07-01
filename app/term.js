import Terminal from './xterm';
import React, { Component } from 'react';

const domainRegex = /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/;

export default class Term extends Component {

  componentDidMount () {
    this.term = new Terminal({
      cols: this.props.cols,
      rows: this.props.rows
    });
    this.term.on('data', (data) => {
      this.props.onData(data);
    });
    this.term.on('title', (title) => {
      this.props.onTitle(title);
    });
    this.term.open(this.refs.term);
  }

  shouldComponentUpdate (nextProps) {
    if (nextProps.rows !== this.props.rows || nextProps.cols !== this.props.cols) {
      this.term.resize(nextProps.cols, nextProps.rows);
    }

    if (this.props.url !== nextProps.url) {
      // when the url prop changes, we make sure
      // the terminal starts or stops ignoring
      // key input so that it doesn't conflict
      // with the <webview>
      if (nextProps.url) {
        this.term.ignoreKeyEvents = true;
      } else {
        this.term.ignoreKeyEvents = false;
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
    this.term.write(data);
  }

  focus () {
    this.term.element.focus();
  }

  componentWillUnmount () {
    this.term.destroy();
  }

  render () {
    return <div>
      <div ref='term' />
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
