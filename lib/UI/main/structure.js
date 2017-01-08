import React from 'react';
import Component from '../component';

import Pane from './pane';
import Panes from './panes';

class Structure extends Component {
  constructor(props) {
    super(props);
  }
  template(css) {
    const {root, subs} = this.props.structure;
    console.log(this.props.structure.id);
    let render = null;
    if(root) {
      render = <Pane key={`pane-${root.uid}`} {...this.props} />;
      if (subs && subs.length >= 1) {
        render = <Panes  {...this.props} />;
      }
    }
    return (render);
  }

  styles() {
    return {
    };
  }
}

export default Structure;
