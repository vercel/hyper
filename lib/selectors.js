import {createSelector} from 'reselect';
import {findChildSessions} from './utils/term-groups';

const getRootGroups_ = termGroups => Object.keys(termGroups)
  .map(uid => termGroups[uid])
  .filter(({parentUid}) => !parentUid);

const getTermGroups = ({termGroups}) => termGroups.termGroups;

export const getRootGroups = createSelector(
  getTermGroups,
  termGroups => getRootGroups_(termGroups)
);

// For each rootGroup, it sorts its children
export const getSortedSessionGroups = createSelector(
  getTermGroups,
  termGroups => getRootGroups_(termGroups).reduce((result, {uid}) =>
    Object.assign(result, {[uid]: findChildSessions(termGroups, uid)}), {})
);
