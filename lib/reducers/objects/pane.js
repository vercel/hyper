import Immutable from 'seamless-immutable';
import * as Layout  from './layout';


function Pane(obj) {
  return Immutable({
    uid: null,
  }).merge(obj);
}

export function addChild(state, pane) {
  const parent = state.panes[state.pane];
  if (parent) {
    const index = parent.childs.length + 1;
    const childs = [...parent.childs.slice(0, index), pane.uid, ...parent.childs.slice(index)];
    state = state.setIn(['panes', parent.uid], parent.merge({
              childs: childs
            }));
  }
  return state;
}


export function request(state, action) {
  const tab =  state.tabs[action.tabId];

  const pane = Pane({
    uid: action.uid
  });
  
  const activeLayout = state.layouts[state.active.layout];
  return state
          .set('active', state.active.merge({
                pane: pane.uid,
                layout: activeLayout.uid
          }))
          .setIn(['layouts', activeLayout.uid], activeLayout.merge({
              pane:pane.uid
          }))
          .setIn(['panes', pane.uid], pane);
}

export function split(state, action) {
  const activeLayout = state.layouts[state.active.layout];
  const split = action.split.toLowerCase();
  const parent = state.panes[state.active.pane];
  
  const pane = Pane({
    uid: action.uid
  });

  if (activeLayout.display) {
    if(activeLayout.display === split) {
        const newLayout = Layout.create({parent:activeLayout.uid, pane:pane.uid});
        return state
                  .setIn(['layouts', activeLayout.uid], activeLayout.merge({
                    layouts: activeLayout.nexts.concat(newLayout.uid)
                  }))
                  .setIn(['layouts', newLayout.uid], newLayout)
                  .setIn(['panes', pane.uid], pane)
                  .set('active', state.active.merge({
                        layout: newLayout.uid,
                        pane: pane.uid  
                  }));
    } else {
      const {nexts} = activeLayout;
      const index = activeLayout.length + 1;
      const layout = Layout.create({parent:activeLayout.uid, display: split, pane:activeLayout.pane});
      const newLayouts = [...nexts.slice(0, index), layout.uid, ...nexts.slice(index)];
      
      state = state.setIn(['layouts', activeLayout.uid], activeLayout.merge({
        pane:null,
        nexts: newLayouts
      }))
      .setIn(['layouts', layout.uid], layout);

      const newLayout = Layout.create({parent:activeLayout.uid, pane:pane.uid});
      return state
                .setIn(['layouts', layout.uid], layout.merge({
                  nexts: layout.nexts.concat(newLayout.uid)
                }))
                .setIn(['layouts', newLayout.uid], newLayout)
                .setIn(['panes', pane.uid], pane)
                .set('active', state.active.merge({
                      layout: newLayout.uid,
                      pane: pane.uid  
                }));
    }
  } else {
    const newLayout = Layout.create({parent:activeLayout.uid, pane:pane.uid});
    return state
              .setIn(['layouts', activeLayout.uid], activeLayout.merge({
                display: split,
                nexts: activeLayout.nexts.concat(newLayout.uid)
              }))
              .setIn(['layouts', newLayout.uid], newLayout)
              .setIn(['panes', pane.uid], pane)
              .set('active', state.active.merge({
                    layout: newLayout.uid,
                    pane: pane.uid  
              }));
  }
}










