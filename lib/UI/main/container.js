import React from 'react';
import Component from '../component';
import Layout from './layout';

class Container extends Component {
  template(css) {
    const {active, displays} = this.props;
    const uid = active.tab;
    const display = displays[uid];
    let render = null;
    if (display) {
      render = (
        <Layout
          key={`layout-${uid}`}
          {...Object.assign({}, this.props, {
            display,
            width:100,
            height:100
          })}
          />);
    }
    return (
      <div
        className={css('container')}
        >
        {render}
      </div>);
  }

  styles() {
    return {
      container: {
        position: 'absolute',
        marginTop: '34px',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        color: '#fff'
      }
    };
  }
}

export default Container;
