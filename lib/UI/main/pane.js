import React from 'react';
import Component from '../component';
import Term from './term';

class Pane extends Component {
  constructor(props) {
    super(props);
    this.handleClick = props.onSelect.bind(null, props.uid);
  }

  template(css) {
    const {uid, active} = this.props;
    const isActive = active.pane === uid;
    const {height, width} = this.props;
    const style = {
      width: width + '%',
      height: height + '%'
    };
    return (
      <div
        onClick={this.handleClick}
        className={css('pane', isActive && 'activePane')}
        style={style}
        >
        <div
          className={css('centered')}
          >
          <Term
            {...Object.assign({}, this.props, {
              uid,
              activeTerm: isActive
            })}
            />
        </div>
        {this.props.main}
      </div>);
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
      },
    };
  }
}

export default Pane;
