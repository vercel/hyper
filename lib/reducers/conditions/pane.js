import {request, split} from '../objects/pane';
import {hasNexts} from '../objects/layout';

const conditions = (state, action) => {
  switch (action.type) {
    case 'PANE_REQUEST':
      return request(state, action);
    case 'SPLITED':
      return split(state, action);
    case 'PANE_SELECT':
    const {layouts} = state;
    const layout = Object.keys(layouts).map(uid => layouts[uid])
                .find(function(layout) {
                    return layout.pane === action.uid;
                  });
    const tab = state.tabs[state.active.tab];
    state = state.setIn(['tabs' , tab.uid], tab.merge({
      title: state.panes[action.uid].uid
    }));
    
    return state.set('active', state.active.merge({
                      pane: action.uid,
                      layout: layout.uid
                }));
    case 'PANE_CLOSE':
      const {active} = action;
      const pane = state.panes[active.pane];
      const lay = state.layouts[active.layout];
      if(lay.parent) {
        const parent = state.layouts[lay.parent];
        let nexts = Object.keys(parent.layouts).map(uid => parent.nexts[uid]);
        let indexOf = nexts.indexOf(lay.uid);
        nexts.splice(indexOf, 1);
        if (hasNexts(lay)) {
          lay.nexts.forEach(function(uid, i) {
            // nexts.push(uid);
            nexts = [...nexts.slice(0, indexOf), uid, ...nexts.slice(indexOf)];
            indexOf++;
            const layout  = state.layouts[uid];
            if(i === 0) {
              state = state.set('active', state.active.merge({
                        pane: layout.pane,
                        layout: parent.uid
                      }));
            }
            state = state.setIn(['layouts' , layout.uid], layout.merge({
              parent: parent.uid
            }));
          })
        } else {
           state = state.set('active', state.active.merge({
                     pane: parent.pane,
                     layout: parent.uid
                   }));
        }
        state = state.setIn(['layouts' , parent.uid] , parent.merge({
          nexts: nexts
        }));
      }
        state = state
        .set('layouts', state.layouts.without(lay.uid))
        .set('panes', state.panes.without(pane.uid));
      return state;
    default:
      return state;
  }
}

export default conditions;