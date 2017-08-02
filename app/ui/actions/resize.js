module.exports = (win, {uid, cols, rows}) => {
  const session = win.sessions.get(uid);
  if (session) {
    session.resize({cols, rows});
  }
};
