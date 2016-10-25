import uuid from 'uuid';
import Immutable from 'seamless-immutable';
import {TERM_GROUP_EXIT, TERM_GROUP_RESIZE} from '../constants/term-groups';
import {SESSION_ADD, SESSION_SET_ACTIVE} from '../constants/sessions';
import findBySession from '../utils/term-groups';
import {decorateTermGroupsReducer} from '../utils/plugins';

const MIN_SIZE = 0.05;
const initialState = Immutable({
  termGroups: {},
  activeSessions: {},
  activeRootGroup: null
});

function TermGroup(obj) {
  return Immutable({
    uid: null,
    sessionUid: null,
    parentUid: null,
    direction: null,
    sizes: null,
    children: []
  }).merge(obj);
}

// Recurse upwards until we find a root term group (no parent).
const findRootGroup = (termGroups, uid) => {
  const current = termGroups[uid];
  if (!current.parentUid) {
    return current;
  }

  return findRootGroup(termGroups, current.parentUid);
};

const setActiveGroup = (state, action) => {
  if (!action.uid) {
    return state.set('activeRootGroup', null);
  }

  const childGroup = findBySession(state, action.uid);
  const rootGroup = findRootGroup(state.termGroups, childGroup.uid);
  return state
    .set('activeRootGroup', rootGroup.uid)
    .setIn(['activeSessions', rootGroup.uid], action.uid);
};

// Reduce existing sizes to fit a new split:
const insertRebalance = (oldSizes, index) => {
  const newSize = 1 / (oldSizes.length + 1);
  // We spread out how much each pane should be reduced
  // with based on their existing size:
  const balanced = oldSizes.map(size => size - (newSize * size));
  return [...balanced.slice(0, index), newSize, ...balanced.slice(index)];
};

// Spread out the removed size to all the existing sizes:
const removalRebalance = (oldSizes, index) => {
  const removedSize = oldSizes[index];
  const increase = removedSize / (oldSizes.length - 1);
  return oldSizes
    .filter((_size, i) => i !== index)
    .map(size => size + increase);
};

const splitGroup = (state, action) => {
  const {splitDirection, uid, activeUid} = action;
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

  const {children} = parentGroup;
  // Insert the new child pane right after the active one:
  const index = children.indexOf(activeGroup.uid) + 1;
  const newChildren = [...children.slice(0, index), newSession.uid, ...children.slice(index)];
  state = state.setIn(['termGroups', parentGroup.uid], parentGroup.merge({
    direction: splitDirection,
    children: newChildren
  }));

  if (parentGroup.sizes) {
    const newSizes = insertRebalance(parentGroup.sizes, index);
    state = state.setIn(['termGroups', parentGroup.uid, 'sizes'], newSizes);
  }

  return state;
};

// Replace the parent by the given child in the tree,
// used when we remove another child and we're left
// with a one-to-one mapping between parent and child.
const replaceParent = (state, parent, child) => {
  if (parent.parentUid) {
    const parentParent = state.termGroups[parent.parentUid];
    // If the parent we're replacing has a parent,
    // we need to change the uid in its children array
    // with `child`:
    const newChildren = parentParent.children.map(uid =>
      uid === parent.uid ? child.uid : uid
    );

    state = state.setIn(['termGroups', parentParent.uid, 'children'], newChildren);
  } else {
    // This means the given child will be
    // a root group, so we need to set it up as such:
    const newSessions = state.activeSessions
      .without(parent.uid)
      .set(child.uid, state.activeSessions[parent.uid]);

    state = state
      .set('activeTermGroup', child.uid)
      .set('activeSessions', newSessions);
  }

  return state
    .set('termGroups', state.termGroups.without(parent.uid))
    .setIn(['termGroups', child.uid, 'parentUid'], parent.parentUid);
};

const removeGroup = (state, uid) => {
  const group = state.termGroups[uid];
  if (group.parentUid) {
    const parent = state.termGroups[group.parentUid];
    const newChildren = parent.children.filter(childUid => childUid !== uid);
    if (newChildren.length === 1) {
      // Since we only have one child left,
      // we can merge the parent and child into one group:
      const child = state.termGroups[newChildren[0]];
      state = replaceParent(state, parent, child);
    } else {
      state = state.setIn(['termGroups', group.parentUid, 'children'], newChildren);
      if (parent.sizes) {
        const childIndex = parent.children.indexOf(uid);
        const newSizes = removalRebalance(parent.sizes, childIndex);
        state = state.setIn(['termGroups', group.parentUid, 'sizes'], newSizes);
      }
    }
  }

  return state
    .set('termGroups', state.termGroups.without(uid))
    .set('activeSessions', state.activeSessions.without(uid));
};

const resizeGroup = (state, uid, sizes) => {
  // Make sure none of the sizes fall below MIN_SIZE:
  if (sizes.find(size => size < MIN_SIZE)) {
    return state;
  }

  return state.setIn(
    ['termGroups', uid, 'sizes'],
    sizes
  );
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SESSION_ADD: {
      if (action.splitDirection) {
        state = splitGroup(state, action);
        return setActiveGroup(state, action);
      }

      const uid = uuid.v4();
      const termGroup = TermGroup({
        uid,
        sessionUid: action.uid
      });

      return state
        .setIn(['termGroups', uid], termGroup)
        .setIn(['activeSessions', uid], action.uid)
        .set('activeRootGroup', uid);
    }
    case SESSION_SET_ACTIVE:
      return setActiveGroup(state, action);
    case TERM_GROUP_RESIZE:
      return resizeGroup(state, action.uid, action.sizes);
    case TERM_GROUP_EXIT:
      return removeGroup(state, action.uid);
    default:
      return state;
  }
};

export default decorateTermGroupsReducer(reducer);
