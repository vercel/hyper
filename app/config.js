import React from 'react';
import { ipcRenderer, remote } from 'electron';

const config = remote.require('./config');

export default class Config extends React.Component {

  constructor () {
    super();
    this.state = {
      config: config.getConfig()
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange () {
    new Notification('HyperTerm configuration reloaded!');
    this.setState({ config: config.getConfig() });
  }

  componentDidMount () {
    ipcRenderer.on('config change', this.onChange);
  }

  // passes `config` as props to the decorated component
  render () {
    const child = React.Children.only(this.props.children);
    const { config } = this.state;
    return React.cloneElement(child, { config });
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('config change', this.onChange);
  }

}
