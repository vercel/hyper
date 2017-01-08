export function findBySession(termGroupState, sessionUid) {
  const {termGroups} = termGroupState;
  return Object.keys(termGroups)
    .map(uid => termGroups[uid])
    .find(group => group.sessionUid === sessionUid);
}

// Find all sessions that are below the given
// termGroup uid in the hierarchy:
export function findChildSessions(termGroups, uid) {
  const group = termGroups[uid];
  if (group.sessionUid) {
    return [uid];
  }

  return group
    .children
    .reduce((total, childUid) => total.concat(
      findChildSessions(termGroups, childUid)
    ), []);
}

// Recurse upwards until we find a root term group (no parent).
export function findRootGroup(termGroups, uid) {
  const current = termGroups[uid];
  if (!current.parentUid) {
    return current;
  }

  return findRootGroup(termGroups, current.parentUid);
}
