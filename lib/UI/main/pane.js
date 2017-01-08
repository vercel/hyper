import React from 'react';
import Component from '../component';

class Pane extends Component {
  constructor(props) {
    super(props);
  }
  
  handleClick(ev) {
    console.log(ev);
  }

  template(css) {
    const {uid, display, layouts, active} = this.props;
    const select = this.props.onSelect.bind(null, uid);
    const isActive = active.pane === uid;
    return (
      <div
      onClick={select}
      className={css('pane', 'flex-item', isActive && 'activePane' )}
      >
        {uid}
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
        height: '100%',
      },
      fit: {
        display: 'block',
        width: '100%',
        height: '100%'
      },
      activePane: {
        background: '#1C293A'
      },
      'flex-item': {
        color: 'white',
        'font-weight': 'bold',
        'font-size': '1em',
        'text-align': 'center'
      }
    };
  }
}

export default Pane;
