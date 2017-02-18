import React from 'react';
import Component from '../component';
import Layout from './layout';

class Container extends Component {
  template(css) {
    const {active, layouts} = this.props;
    const layout = layouts[active.tab];
    const props = Object.assign({}, this.props, {
      layout
    });
    return (
      <div
        className={css('container')}
        >
        {layout &&
          <Layout
            key={`layout-${layout.uid}`}
            {...props}
            />
        }
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
