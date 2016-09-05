// Finds a term group by it's session uid
// TODO: Does this belong somewhere else,
// e.g. exported from the reducer?
export function findBySession (termGroupState, sessionUid) {
  const { termGroups } = termGroupState;
  return Object.keys(termGroups)
    .map((uid) => termGroups[uid])
    .find((group) => group.sessionUid === sessionUid);
}
