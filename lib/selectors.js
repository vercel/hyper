import {createSelector} from 'reselect';

const getTermGroups = ({termGroups}) => termGroups.termGroups;
const getRootGroups = createSelector(
  getTermGroups,
  termGroups => Object.keys(termGroups)
    .map(uid => termGroups[uid])
    .filter(({parentUid}) => !parentUid)
);

export default getRootGroups;
