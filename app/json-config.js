import React from 'react';
import {remote} from 'electron';
const os = remote.require('os');
const fs = remote.require('fs');

function expandPath (path) {
  return path.startsWith('~') ? path.replace('~', os.homedir()) : path;
}

function writeJson (path, json) {
  return fs.writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
}

export default class JsonConfig extends React.Component {
  componentWillMount () {
    this.state = {};

    const absolutePath = expandPath(this.props.path);

    try {
      fs.accessSync(absolutePath);
    } catch (e) {
      writeJson(absolutePath, {});
    }

    this.read();

    this.write = this.write.bind(this);
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.path !== nextProps.path) {
      this.read(nextProps.path);
    }
  }

  render () {
    const child = React.Children.only(this.props.children);
    return React.cloneElement(child, {
      config: this.state.config,
      setConfig: this.write
    });
  }

  read (path = this.props.path) {
    const absolutePath = expandPath(path);
    const config = JSON.parse(fs.readFileSync(absolutePath));
    const configWithDefaults = Object.assign({}, this.props.defaults, config);
    this.setState({ config: configWithDefaults });
  }

  write (changes) {
    const absolutePath = expandPath(this.props.path);
    const config = JSON.parse(fs.readFileSync(absolutePath));
    Object.assign(config, changes);
    writeJson(absolutePath, config);

    this.read();
  }
}
