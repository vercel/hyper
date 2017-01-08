import React from 'react';
import Component from '../component';

import Pane from './pane';
import Panes from './panes';

class Layout extends Component {
  constructor(props) {
    super(props);
  }
  template(css) {
    const {layout, layouts, panes, displayBorder} = this.props;
    const {display, pane} = layout;
    let render = null;
    render = (<div
                className={css('panes', display && `panes_${display}` )}
                >
                {pane &&
                    <Pane key={`pane-${pane}`}  {...Object.assign({}, this.props, {
                      uid: pane
                    })}/>
                }
                {
                  layout.nexts.map((uid, i) => {
                    const lay = layouts[uid];
                    const props = Object.assign({}, this.props, {
                      layout: lay,
                      displayBorder:display
                    });;
                    return <Layout 
                        key={`layout-${lay.uid}`}
                        {...props} />;
    
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
      'panes': {
        display: 'flex', /* or inline-flex */
        flex: 1,
        outline: 'none',
        position: 'relative',
        width: '100%',
        height: '100%'
      },

      'panes_vertical': {
        flexDirection: 'row'
      },

      'panes_horizontal': {
        flexDirection: 'column'
      },
      divider: {
        boxSizing: 'border-box',
        zIndex: '1',
        backgroundClip: 'padding-box',
        flexShrink: 0
      },
      'divider_horizontal': {
          // borderBottom: '1px solid blue',
      },
      'divider_vertical': {
          // borderLeft: '1px solid red',
          // borderRight: '1px solid red',
      }
    };
  }
}

export default Layout;
