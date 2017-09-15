module.exports.normalize = keybinding => {
  function sortAlphabetically(a, b) {
    return a.localeCompare(b);
  }

  return keybinding.toLowerCase().split('+').sort(sortAlphabetically).join('+');
};

module.exports.returnCommand = (keys, commands) => {
  return commands[this.normalize(keys)];
};
