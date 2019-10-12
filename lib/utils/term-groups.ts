export default function findBySession(termGroupState, sessionUid) {
  const {termGroups} = termGroupState;
  return Object.keys(termGroups)
    .map(uid => termGroups[uid])
    .find(group => group.sessionUid === sessionUid);
}
