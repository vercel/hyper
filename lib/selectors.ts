import {createSelector} from 'reselect';
import {HyperState} from './hyper';

const getTermGroups = ({termGroups}: Pick<HyperState, 'termGroups'>) => termGroups.termGroups;
const getRootGroups = createSelector(
  getTermGroups,
  termGroups =>
    Object.keys(termGroups)
      .map(uid => termGroups[uid])
      .filter(({parentUid}) => !parentUid)
);

export default getRootGroups;
