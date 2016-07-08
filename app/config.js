/* global Notification */
/* eslint no-new:0 */
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
    this.setState({ config: config.getConfig() });
  }

  componentDidMount () {
    ipcRenderer.on('config change', this.onChange);
    ipcRenderer.on('plugins change', this.onChange);
  }

  // passes `config` as props to the decorated component
  render () {
    const child = React.Children.only(this.props.children);
    const { config } = this.state;
    const decorate = remote.require('./plugins').decorateConfig;
    return React.cloneElement(child, { config: decorate(config) });
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('config change', this.onChange);
    ipcRenderer.removeListener('plugins change', this.onChange);
  }

}
