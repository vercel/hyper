import React from 'react';
import Component from '../component';
import {decorate} from '../../utils/plugins';
import Pane_ from './pane';

const Pane = decorate(Pane_, 'Pane');

class Layout extends Component {
  template(css) {
    const {display, pane} = this.props;
    let {height, width} = this.props;
    const {split, panes} = display;
    let render = null;
    if (split) {
      const length = pane ? panes.length + 1 : panes.length;
      if (split === 'horizontal') {
        height = (height / length);
      } else if (split === 'vertical') {
        width = (width / length);
      }
    }
    render = (
      <div
        className={css('panes', split && `panes${split}`)}
        >
        {pane &&
          <Pane
            key={`pane-${pane.uid}`}
            {...Object.assign({}, this.props, {
              uid:pane.uid,
              width,
              height
            })}
            />
        }
        {
          panes.map((uid) => {
            const displays = this.props.displays;
            const display = Object.keys(displays).map(uid => displays[uid])
            .find(display => {
              return display.ref === uid;
            });
            if (display) {
              return (
                <Layout
                  key={`layout-${uid}`}
                  {...Object.assign({}, this.props, {
                    display,
                    pane: {
                      uid
                    },
                    width:100,
                    height:100
                  })}
                  />);
            }
            return (<Pane
              key={`pane-${uid}`}
              {...Object.assign({}, this.props, {
                uid,
                width,
                height
              })}
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
