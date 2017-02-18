import Immutable from 'seamless-immutable';
import {create, hasNexts} from './layout';

function Pane(obj) {
  return Immutable({
    uid: null
  }).merge(obj);
}

export function request(state, action) {
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
            pane: pane.uid
          }))
          .setIn(['panes', pane.uid], pane);
}

export function split(state, action) {
  const activeLayout = state.layouts[state.active.layout];
  const split = action.split.toLowerCase();
  const pane = Pane({
    uid: action.uid
  });

  if (activeLayout.display) {
    if (activeLayout.display === split) {
      const newLayout = create({parent: activeLayout.uid, pane: pane.uid});
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
    }
    const {nexts} = activeLayout;
    const index = activeLayout.length + 1;
    const layout = create({parent: activeLayout.uid, display: split, pane: activeLayout.pane});
    const newLayouts = [...nexts.slice(0, index), layout.uid, ...nexts.slice(index)];

    state = state.setIn(['layouts', activeLayout.uid], activeLayout.merge({
      pane: null,
      nexts: newLayouts
    }))
    .setIn(['layouts', layout.uid], layout);

    const newLayout = create({parent: activeLayout.uid, pane: pane.uid});
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
  const newLayout = create({parent: activeLayout.uid, pane: pane.uid});
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

export function select(state, action) {
  const {layouts} = state;
  const layout = Object.keys(layouts).map(uid => layouts[uid])
  .find(layout => {
    return layout.pane === action.uid;
  });
  const tab = state.tabs[state.active.tab];
  state = state.setIn(['tabs', tab.uid], tab.merge({
    title: state.panes[action.uid].uid
  }));

  return state.set('active', state.active.merge({
    pane: action.uid,
    layout: layout.uid
  }));
}

export function close(state, action) {
  const {active} = action;
  const pane = state.panes[active.pane];
  const layout = state.layouts[active.layout];

  if (layout.parent) {
    const parent = state.layouts[layout.parent];
    let nexts = Object.keys(parent.nexts).map(uid => parent.nexts[uid]);
    let indexOf = nexts.indexOf(layout.uid);
    nexts.splice(indexOf, 1);

    if (hasNexts(layout)) {
      layout.nexts.forEach((uid, i) => {
        nexts = [...nexts.slice(0, indexOf), uid, ...nexts.slice(indexOf)];
        indexOf++;
        const layout = state.layouts[uid];

        if (i === 0) {
          state = state
          .set('active', state.active.merge({
            pane: layout.pane,
            layout: parent.uid
          }));
        }
        state = state.setIn(['layouts', layout.uid], layout.merge({
          parent: parent.uid
        }));
      });
    } else {
      state = state.set('active', state.active.merge({
        pane: parent.pane,
        layout: parent.uid
      }));
    }
    state = state.setIn(['layouts', parent.uid], parent.merge({nexts}));
  }

  return state
    .set('layouts', state.layouts.without(layout.uid))
    .set('panes', state.panes.without(pane.uid));
}
