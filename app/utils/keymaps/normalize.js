// This function receives a keymap in any key order and returns
// the same keymap alphatetically sorted by the clients locale.
// eg.: cmd+alt+o -> alt+cmd+o
// We do this in order to normalize what the user defined to what we
// internally parse. By doing this, you can set your keymaps in any given order
// eg.: alt+cmd+o, cmd+alt+o, o+alt+cmd, etc. #2195

module.exports = keybinding => {
  function sortAlphabetically(a, b) {
    return a.localeCompare(b);
  }

  return keybinding
    .toLowerCase()
    .split('+')
    .sort(sortAlphabetically)
    .join('+');
};
