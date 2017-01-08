import React from 'react';
import Component from '../component';
// import Structure from './structure';
import Layout from './layout';

class Container extends Component {
  constructor(props) {
    super(props);
  }

  template(css) {
    const {active, layouts, panes} = this.props;
    const layout = layouts[active.tab];
    const props = Object.assign({}, this.props, {
      layout:layout
    });
    // if(layout) {
    //   const next = Object.keys(layouts).map(uid => layouts[uid])
    //               .find(function(lay) {
    //                   return lay.parent === layout.uid;
    //                 });
    //   console.log(next);
    // }
  
    return (
      <div
        className={css('container')}
        >
        {
          layout &&
            <Layout 
              key={`layout-${layout.uid}`}
              {...props} />
        }
      </div>);

    // const {id} = this.props.structure;
    // return (
    //   <div
    //     className={css('container')}
    //     >
    //   </div>);
      // <Structure 
      // key={`structure-${id}`}
      // {...this.props} />
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
