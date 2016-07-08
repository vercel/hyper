import React from 'react';

export default class Plugins extends React.Component {

  componentDidMount () {

  }

  render () {
    const child = React.Children.only(this.props.children);
    return React.cloneElement(child, this.props);
  }

  componentWillUnmount () {

  }

}
