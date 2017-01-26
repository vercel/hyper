import React from 'react';
import ReactDOM from 'react-dom';
import Component from '../component';
import Term from './term';

class Pane extends Component {
  handleClick(ev) {
    console.log(ev);
  }

  template(css) {
    const {uid, active} = this.props;
    const select = this.props.onSelect.bind(null, uid);
    const isActive = active.pane === uid;
    return (
      <div
        onClick={select}
        className={css('pane', isActive && 'activePane')}
        >
        <Term/>
        {this.props.main}
      </div>
    );
  }

  styles() {
    return {
      pane: {
        flex: 1,
        outline: 'none',
        position: 'relative',
        width: '100%',
        height: '100%'
      },
      // terminal: {
      //   backgroundColor: '#000',
      //   color: '#fff',
      //   fontFamily: 'courier-new, courier, monospace',
      //   position: 'relative'
      // },
      activePane: {
        // background: '#1C293A'
      }
    };
  }
}

export default Pane;
