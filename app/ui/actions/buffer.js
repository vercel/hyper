module.exports = (win, {uid, data, escaped}) => {
  const session = win.sessions.get(uid);

  if (escaped) {
    const escapedData = session.shell.endsWith('cmd.exe') ?
    `"${data}"` : // This is how cmd.exe does it
    `'${data.replace(/'/g, `'\\''`)}'`; // Inside a single-quoted string nothing is interpreted

    session.write(escapedData);
  } else {
    session.write(data);
  }
};
