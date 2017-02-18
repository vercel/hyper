import React from 'react';
import Component from '../component';
import {decorate} from '../../utils/plugins';
import Pane_ from './pane';
const Pane = decorate(Pane_, 'Pane');

class Layout extends Component {
  template(css) {
    const {layout, layouts} = this.props;
    const {display, pane} = layout;
    let render = null;
    let height = 100;
    let width = 100;
    if (pane) {
      const length = layout.nexts.length+1;
      if (display) {
        if(display === 'horizontal') {
          height = (100/length);
        } else if (display === 'vertical') {
          width = (100/length);
        }
      }
    }
    
    render = (
      <div
        className={css('panes', display && `panes${display}`)}
        >
        {pane &&
          <Pane
            key={`pane-${pane}`}
            {...Object.assign({}, this.props, {
              uid: pane,
              width,
              height
            })}
            />
          }
        {
          layout.nexts.map((uid) => {
            const lay = layouts[uid];
            const props = Object.assign({}, this.props, {
              layout: lay,
              width,
              height
            });
            return (<Layout
              key={`layout-${lay.uid}`}
              {...props}
              />);
          })
      }
      </div>);
    return (render);
    // <div
    //   key="divider"
    //   className={css('divider', `divider_${display}`)}
    //   />
  }

  styles() {
    return {
      panes: {
        display: 'flex', /* or inline-flex */
        flex: 1,
        outline: 'none',
        position: 'relative',
        width: '100%',
        height: '100%'
      },

      panesvertical: {
        flexDirection: 'row'
      },

      paneshorizontal: {
        flexDirection: 'column'
      },
      divider: {
        boxSizing: 'border-box',
        zIndex: '1',
        backgroundClip: 'padding-box',
        flexShrink: 0
      },
      dividerhorizontal: {
          // borderBottom: '1px solid blue',
      },
      dividervertical: {
          // borderLeft: '1px solid red',
          // borderRight: '1px solid red',
      }
    };
  }
}

export default Layout;
