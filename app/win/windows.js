const windowSet = new Set([]);

module.exports.gets = () => new Set([...windowSet]); // return a clone

// function to retrieve the last focused window in windowSet;
// added to app object in order to expose it to plugins.
module.exports.lastFocused = () => {
  if (!windowSet.size) {
    return null;
  }
  return Array.from(windowSet).reduce((lastWindow, win) => {
    return win.focusTime > lastWindow.focusTime ? win : lastWindow;
  });
};

module.exports.new = win => {
  windowSet.add(win);
};

module.exports.delete = win => {
  windowSet.delete(win);
};

module.exports.size = () => {
  return windowSet.size;
};

module.exports.get = () => {
  return windowSet;
};
