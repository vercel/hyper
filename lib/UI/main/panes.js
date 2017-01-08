import React from 'react';
import Component from '../component';
import PaneWeb from './pane-web';
import Pane from './pane';
import Structure from './structure';


class Panes extends Component {
  constructor(props) {
    super(props);
  }
  template(css) {
    const {struct, structure} = this.props;
    const {root, subs} = structure;
    let {id} = structure;
    const direction = root.display.toLowerCase();
    const props = Object.assign({}, this.props, {
      direction: direction ? direction : false
    });
    return (
          <div
            className={css('panes', direction && `panes_${direction}`)}
            >
            <Pane key={`pane-${root.uid}`}  {...props}/>
            {
              subs.map((sub, i) => {
                const subs = sub.childs.map((child) => {
                    return struct.find(function(pane) {
                        return pane.uid === child;
                    });
                });
                const structure = Object.assign({}, {
                  id: id++,
                  root:sub,
                  subs:subs
                });
                
                const props = Object.assign({}, this.props, {
                  structure:structure
                });
                return <Structure 
                        key={`structure-${id}`}
                        {...props} />
              })
            }
            </div>
    );
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
      
      divi: {
        background: 'white',
        color: 'red'
      }
      
      // divider: {
      //   boxSizing: 'border-box',
      //   zIndex: '1',
      //   backgroundClip: 'padding-box',
      //   flexShrink: 0
      // },
      // 
      // 'divider_vertical': {
      //   borderLeft: '5px solid rgba(255, 255, 255, 0)',
      //   borderRight: '5px solid rgba(255, 255, 255, 0)',
      //   width: '11px',
      //   margin: '0 -5px',
      //   cursor: 'col-resize'
      // },
      // 
      // 'divider_horizontal': {
      //   height: '11px',
      //   margin: '-5px 0',
      //   borderTop: '5px solid rgba(255, 255, 255, 0)',
      //   borderBottom: '5px solid rgba(255, 255, 255, 0)',
      //   cursor: 'row-resize',
      //   width: '100%'
      // },
      
      // panes: {
      //   display: 'flex',
      //   flex: 1,
      //   outline: 'none',
      //   position: 'relative',
      //   width: '100%',
      //   height: '100%'
      // },
    };
  }

}

export default Panes;
