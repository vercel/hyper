import {v4 as uuidv4} from 'uuid';
import Immutable, {Immutable as ImmutableType} from 'seamless-immutable';
import {TERM_GROUP_EXIT, TERM_GROUP_RESIZE} from '../constants/term-groups';
import {SESSION_ADD, SESSION_SET_ACTIVE, SessionAddAction} from '../constants/sessions';
import findBySession from '../utils/term-groups';
import {decorateTermGroupsReducer} from '../utils/plugins';
import {ITermGroup, ITermState, ITermGroups, HyperActions} from '../hyper';

const MIN_SIZE = 0.05;
const initialState = Immutable<ITermState>({
  termGroups: {},
  activeSessions: {},
  activeRootGroup: null
});

function TermGroup(obj: Immutable.DeepPartial<ITermGroup>) {
  const x: ITermGroup = {
    uid: '',
    sessionUid: null,
    parentUid: null,
    direction: null,
    sizes: null,
    children: []
  };
  return Immutable(x).merge(obj);
}

// Recurse upwards until we find a root term group (no parent).
const findRootGroup = (termGroups: ImmutableType<ITermGroups>, uid: string): ImmutableType<ITermGroup> => {
  const current = termGroups[uid];
  if (!current.parentUid) {
    return current;
  }

  return findRootGroup(termGroups, current.parentUid);
};

const setActiveGroup = (state: ImmutableType<ITermState>, action: {uid: string}) => {
  if (!action.uid) {
    return state.set('activeRootGroup', null);
  }

  const childGroup = findBySession(state, action.uid)!;
  const rootGroup = findRootGroup(state.termGroups, childGroup.uid);
  return state.set('activeRootGroup', rootGroup.uid).setIn(['activeSessions', rootGroup.uid], action.uid);
};

// Reduce existing sizes to fit a new split:
const insertRebalance = (oldSizes: ImmutableType<number[]>, index: number) => {
  const newSize = 1 / (oldSizes.length + 1);
  // We spread out how much each pane should be reduced
  // with based on their existing size:
  const balanced = oldSizes.map((size) => size - newSize * size);
  return [...balanced.slice(0, index).asMutable(), newSize, ...balanced.slice(index).asMutable()];
};

// Spread out the removed size to all the existing sizes:
const removalRebalance = (oldSizes: ImmutableType<number[]>, index: number) => {
  const removedSize = oldSizes[index];
  const increase = removedSize / (oldSizes.length - 1);
  return Immutable(
    oldSizes
      .asMutable()
      .filter((_size: number, i: number) => i !== index)
      .map((size: number) => size + increase)
  );
};

const splitGroup = (state: ImmutableType<ITermState>, action: SessionAddAction) => {
  const {splitDirection, uid, activeUid} = action;
  const activeGroup = findBySession(state, activeUid!)!;
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
    uid: uuidv4(),
    sessionUid: uid,
    parentUid: parentGroup.uid
  });

  state = state.setIn(['termGroups', newSession.uid], newSession);
  if (parentGroup.sessionUid) {
    const existingSession = TermGroup({
      uid: uuidv4(),
      sessionUid: parentGroup.sessionUid,
      parentUid: parentGroup.uid
    });

    return state.setIn(['termGroups', existingSession.uid], existingSession).setIn(
      ['termGroups', parentGroup.uid],
      parentGroup.merge({
        sessionUid: '',
        direction: splitDirection,
        children: [existingSession.uid, newSession.uid]
      })
    );
  }

  const {children} = parentGroup;
  // Insert the new child pane right after the active one:
  const index = children.indexOf(activeGroup.uid) + 1;
  const newChildren = [...children.slice(0, index).asMutable(), newSession.uid, ...children.slice(index).asMutable()];
  state = state.setIn(
    ['termGroups', parentGroup.uid],
    parentGroup.merge({
      direction: splitDirection,
      children: newChildren
    })
  );

  if (parentGroup.sizes) {
    const newSizes = insertRebalance(parentGroup.sizes, index);
    state = state.setIn(['termGroups', parentGroup.uid, 'sizes'], newSizes);
  }

  return state;
};

// Replace the parent by the given child in the tree,
// used when we remove another child and we're left
// with a one-to-one mapping between parent and child.
const replaceParent = (
  state: ImmutableType<ITermState>,
  parent: ImmutableType<ITermGroup>,
  child: ImmutableType<ITermGroup>
) => {
  if (parent.parentUid) {
    const parentParent = state.termGroups[parent.parentUid];
    // If the parent we're replacing has a parent,
    // we need to change the uid in its children array
    // with `child`:
    const newChildren = parentParent.children.map((uid: string) => (uid === parent.uid ? child.uid : uid));

    state = state.setIn(['termGroups', parentParent.uid, 'children'], newChildren);
  } else {
    // This means the given child will be
    // a root group, so we need to set it up as such:
    const newSessions = state.activeSessions.without(parent.uid).set(child.uid, state.activeSessions[parent.uid]);

    state = state
      .set('activeTermGroup', child.uid)
      .set('activeRootGroup', child.uid)
      .set('activeSessions', newSessions);
  }

  return state
    .set('termGroups', state.termGroups.without(parent.uid))
    .setIn(['termGroups', child.uid, 'parentUid'], parent.parentUid);
};

const removeGroup = (state: ImmutableType<ITermState>, uid: string) => {
  const group = state.termGroups[uid];
  // when close tab with multiple panes, it remove group from parent to child. so maybe the parentUid exists but parent group have removed.
  // it's safe to remove the group.
  if (group.parentUid && state.termGroups[group.parentUid]) {
    const parent = state.termGroups[group.parentUid];
    const newChildren = parent.children.filter((childUid) => childUid !== uid);
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

const resizeGroup = (state: ImmutableType<ITermState>, uid: string, sizes: number[]) => {
  // Make sure none of the sizes fall below MIN_SIZE:
  if (sizes.find((size) => size < MIN_SIZE)) {
    return state;
  }

  return state.setIn(['termGroups', uid, 'sizes'], sizes);
};

const reducer = (state = initialState, action: HyperActions) => {
  switch (action.type) {
    case SESSION_ADD: {
      if (action.splitDirection) {
        state = splitGroup(state, action);
        return setActiveGroup(state, action);
      }

      const uid = uuidv4();
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

export type ITermGroupReducer = typeof reducer;

export default decorateTermGroupsReducer(reducer);
