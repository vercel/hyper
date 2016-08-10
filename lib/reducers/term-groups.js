import uuid from 'uuid';
import Immutable from 'seamless-immutable';
import { TERM_GROUP_SPLIT } from '../constants/term-groups';
import { SESSION_ADD, SESSION_SET_ACTIVE } from '../constants/sessions';
import { findBySession } from '../utils/term-groups';
import { decorateTermGroupsReducer } from '../utils/plugins';

const initialState = Immutable({
  termGroups: {},
  activeRootGroup: null
});

function TermGroup (obj) {
  return Immutable({
    sessionUid: null,
    direction: null,
    parentUid: null,
    activeSessionUid: null,
    children: []
  }).merge(obj);
}

const splitGroup = (state, action) => {
  const { splitDirection, uid, activeUid } = action;
  const activeGroup = findBySession(state, activeUid);
  // If we're splitting in the same direction as the current active
  // group's parent - or if it's the first split for that group -
  // we want the parent to get another child:
  let parentGroup = activeGroup.parentUid ? state.termGroups[activeGroup.parentUid] : activeGroup;
  // If we're splitting in a different direction, we want the current
  // active group to become a new parent instead:
  if (parentGroup.direction && parentGroup.direction !== splitDirection) {
    parentGroup = activeGroup;
  }

  // If the group has a session (i.e. we're creating a new parent)
  // we need to create two new groups,
  // one for the existing session and one for the new split:
  //                          P
  //      P      ->         /   \
  //                       G     G
  const newSession = TermGroup({
    uid: uuid.v4(),
    sessionUid: uid,
    parentUid: parentGroup.uid
  });

  state = state.setIn(['termGroups', newSession.uid], newSession);
  if (parentGroup.sessionUid) {
    const existingSession = TermGroup({
      uid: uuid.v4(),
      sessionUid: parentGroup.sessionUid,
      parentUid: parentGroup.uid
    });

    return state
      .setIn(['termGroups', existingSession.uid], existingSession)
      .setIn(['termGroups', parentGroup.uid], parentGroup.merge({
        sessionUid: null,
        direction: splitDirection,
        children: [existingSession.uid, newSession.uid]
      }));
  }

  return state
    .setIn(['termGroups', parentGroup.uid], parentGroup.merge({
      direction: splitDirection,
      children: [...parentGroup.children, newSession.uid]
    }));
};

// Recurse upwards until we find a root term group (no parent).
const findRootGroup = (termGroups, uid) => {
  const current = termGroups[uid];
  if (!current.parentUid) return current;
  return findRootGroup(termGroups, current.parentUid);
};

const setActiveGroup = (state, action) => {
  if (!action.uid) return state.set('activeRootGroup', null);
  const childGroup = findBySession(state, action.uid);
  const rootGroup = findRootGroup(state.termGroups, childGroup.uid);
  return state
    .set('activeRootGroup', rootGroup.uid)
    .setIn(['termGroups', rootGroup.uid, 'activeSessionUid'], action.uid);
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SESSION_ADD:
      if (action.splitDirection) {
        return splitGroup(state, action);
      }

      const uid = uuid.v4();
      const termGroup = TermGroup({
        uid,
        sessionUid: action.uid,
        activeSessionUid: action.uid
      });

      return state
        .setIn(['termGroups', uid], termGroup)
        .set('activeRootGroup', uid);
    case SESSION_SET_ACTIVE:
      return setActiveGroup(state, action);
    case TERM_GROUP_SPLIT:
      return splitGroup(state, action);
    default:
      return state;
  }
};

export default decorateTermGroupsReducer(reducer);
