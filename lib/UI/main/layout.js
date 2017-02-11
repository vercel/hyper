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
        height /= length;
      } else if (split === 'vertical') {
        width /= length;
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
              uid: pane.uid,
              width,
              height
            })}
            />
        }
        {
          panes.map(uid => {
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
                    width: 100,
                    height: 100
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
  }

  styles() {
    return {
      panes: {
        display: 'flex', /* or inline-flex */
        flex: 1,
        outline: 'none',
        position: 'relative',
        width: '100%',
        height: '100%',
      },

      panesvertical: {
        flexDirection: 'row'
      },

      paneshorizontal: {
        flexDirection: 'column'
      },
      divider: {
        backgroundClip: 'padding-box',
        flexShrink: 0
      },
    };
  }
}

export default Layout;
