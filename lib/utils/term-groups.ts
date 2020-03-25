import {ITermState} from '../hyper';
import {Immutable} from 'seamless-immutable';

export default function findBySession(termGroupState: Immutable<ITermState>, sessionUid: string) {
  const {termGroups} = termGroupState;
  return Object.keys(termGroups)
    .map((uid) => termGroups[uid])
    .find((group) => group.sessionUid === sessionUid);
}
