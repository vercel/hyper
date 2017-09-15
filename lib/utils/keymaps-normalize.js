module.exports.normalize = keybinding => {
  function sortAlphabetically(a, b) {
    return a.localeCompare(b);
  }

  return keybinding.split('+').sort(sortAlphabetically).join('+').toLowerCase();
};

module.exports.returnCommand = (keys, commands) => {
  return commands[this.normalize(keys)];
};
