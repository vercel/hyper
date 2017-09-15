function normalize(keybinding) {
  function sortAlphabetically(a, b) {
    return a.localeCompare(b);
  }

  return keybinding.split('+').sort(sortAlphabetically).join('+').toLowerCase();
}

function getNormalizedKeyMaps(userKeymaps) {
  const normalized = {};

  for (const keymap in userKeymaps) {
    if (userKeymaps[keymap]) {
      normalized[normalize(keymap)] = userKeymaps[keymap].toLowerCase();
    }
  }

  return normalized;
}

module.exports.returnCommand = (keys, commands) => {
  return getNormalizedKeyMaps(commands)[normalize(keys)];
};
