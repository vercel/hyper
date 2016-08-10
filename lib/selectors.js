import { createSelector } from 'reselect';

const getTermGroups = ({ termGroups }) => termGroups.termGroups;
export const getRootGroups = createSelector(
  getTermGroups,
  termGroups => Object.keys(termGroups)
    .map(uid => termGroups[uid])
    .filter(({ parentUid }) => !parentUid)
);
