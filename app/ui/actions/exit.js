module.exports = (win, {uid}) => {
  const session = win.sessions.get(uid);
  if (session) {
    session.exit();
  } else {
    console.log('session not found by', uid);
  }
};
