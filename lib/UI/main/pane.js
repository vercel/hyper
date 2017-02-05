import React from 'react';
import Component from '../component';
import {accelerators, isAccelerator} from '../../../app/accelerators';
import Layout from './layout';
import Term from './term';

class Pane extends Component {
  constructor(props) {
    super();
    // this.mv = {
    //   left: accelerators.leftPane,
    //   right: accelerators.rightPane,
    //   up: accelerators.topPane,
    //   down: accelerators.bottomPane,
    // }
    // this.keyDown = this.keyDown.bind(this);
  }
  
  // keyDown(ev) {
  //   const left = 37;
  //   const right = 39;
  //   const up = 38;
  //   const down = 40;
  // }

  handleClick(ev) {
    console.log(ev);
  }
  
  componentDidMount() {
  }
  
  template(css) {
    const {uid, active, panes} = this.props;
    const pane = panes[uid];
    const select = this.props.onSelect.bind(null, uid);
    const isActive = active.pane === uid;
    let {height, width} = this.props;
    const style = {
      width: width + '%',
      height: height + '%'
    };
      const size = {
        width: width + '%',
        height: height + '%'
      };
      return (
        <div
          onClick={select}
          className={css('pane', isActive && 'activePane')}
          style={style}
          >
          <div
            className={css('centered')}
            >
            <h2> {uid} </h2>
            <h4> {pane.num} </h4>
          </div>
          {this.props.main}
        </div>);
      // <Term
      //   {...Object.assign({}, this.props, {
      //     uid,
      //     activeTerm: isActive
      //   })}
      //   />
  }

  styles() {
    return {
      pane: {
        flex: 1,
        outline: 'none',
        position: 'relative'
      },
      activePane: {
        background: '#1C293A'
      },
      centered: {
        textAlign: 'center'
      }
    };
  }
}

export default Pane;
