import React from 'react';
import {remote} from 'electron';
const Config = remote.require('electron-config');
const os = remote.require('os');
const fs = remote.require('fs');

import defaultConfig from './default-config.json';

function expandPath (path) {
  return path.startsWith('~') ? path.replace('~', os.homedir()) : path;
}

export default class Store extends React.Component {
  componentWillMount () {
    this.state = {};
    this.write = this.write.bind(this);
    this.expandedPath = expandPath(this.props.path);
    this.cache = new Config();

    try {
      fs.accessSync(this.expandedPath);
    } catch (e) {
      fs.writeFileSync(
        this.expandedPath,
        JSON.stringify(defaultConfig, null, 2) + '\n'
      );
    }

    this.read();
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.path !== nextProps.path) {
      this.expandedPath = expandPath(nextProps.path);
      this.read();
    }
  }

  render () {
    const child = React.Children.only(this.props.children);
    return React.cloneElement(child, {
      store: this.state.store,
      saveToStore: this.write
    });
  }

  read () {
    const config = JSON.parse(fs.readFileSync(this.expandedPath));
    const cache = this.cache.store;
    const store = {
      config: Object.assign({}, config.config, cache.config)
    };
    this.setState({ store });
  }

  write (path, newValue) {
    if (newValue === undefined) {
      this.cache.delete(path);
    } else {
      this.cache.set(path, newValue);
    }

    this.read();
  }
}
