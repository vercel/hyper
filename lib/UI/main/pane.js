import React from 'react';
import Component from '../component';
import Term from './term';

class Pane extends Component {
  handleClick(ev) {
    console.log(ev);
  }

  template(css) {
    const {uid, active, width, height} = this.props;
    const select = this.props.onSelect.bind(null, uid);
    // const terms = ptys.ptys;
    // const term = Object.keys(terms).map(uid => terms[uid])
    // .find(pty => {
    //   return pty.uid === uid;
    // });
    // console.log(term);
    const isActive = active.pane === uid;
    const style = {
      width: width + '%',
      height: height + '%'
    };
    return (
      <div
        onClick={select}
        className={css('pane', isActive && 'activePane')}
        style={style}
        >
        <Term
          {...Object.assign({}, this.props, {
            uid,
            activeTerm: isActive
          })}
          />
        {this.props.main}
      </div>
    );
  }

  styles() {
    return {
      pane: {
        flex: 1,
        outline: 'none',
        position: 'relative'
      },
      activePane: {
        // background: '#1C293A'
      }
    };
  }
}

export default Pane;
