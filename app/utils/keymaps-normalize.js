module.exports = keybinding => {
  function sortAlphabetically(a, b) {
    return a.localeCompare(b);
  }

  return keybinding.toLowerCase().split('+').sort(sortAlphabetically).join('+');
};
