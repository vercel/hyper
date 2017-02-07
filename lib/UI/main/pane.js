import React from 'react';
import Component from '../component';
import {accelerators, isAccelerator} from '../../../app/accelerators';
import Term from './term';

class Pane extends Component {
  constructor(props) {
    super(props);
    this.select = props.onSelect.bind(null, props.uid);
    // this.mv = {
    //   left: accelerators.leftPane,
    //   right: accelerators.rightPane,
    //   up: accelerators.topPane,
    //   down: accelerators.bottomPane,
    // }
  }

  // keyDown(ev) {
    // const left = 37;
    // const right = 39;
    // const up = 38;
    // const down = 40;
  // }

  handleClick(ev) {
    console.log(ev);
  }

  componentDidMount() {
  }

  template(css) {
    const {uid, active, panes} = this.props;
    const pane = panes[uid];
    const isActive = active.pane === uid;
    const {height, width} = this.props;
    const style = {
      width: width + '%',
      height: height + '%'
    };
    return (
      <div
        onClick={this.select}
        className={css('pane', isActive && 'activePane')}
        style={style}
        >
        <div
          className={css('centered')}
          >
          <Term
            {...Object.assign({}, this.props, {
              uid,
              activeTerm: isActive,
            })}
            />

        </div>
        {this.props.main}
      </div>);
      // <h2> {uid} </h2>
      // <h4> {pane.num} </h4>
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
