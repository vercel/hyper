const platform = process.platform;

const isMac = platform === 'darwin';

const prefix = isMac ? 'Cmd' : 'Ctrl+Shift';

const applicationMenu = { // app/menu.js
  preferences: ',',
  quit: isMac ? 'Q' : '',

  // Shell/File menu
  newWindow: 'N',
  newTab: 'T',
  splitVertically: 'D',
  splitHorizontally: isMac ? 'Shift+D' : 'E',
  closeSession: 'W',
  closeWindow: isMac ? 'Shift+W' : 'Q',

  // Edit menu
  undo: 'Z',
  redo: isMac ? 'Shift+Z' : 'Y',
  cut: 'X',
  copy: 'C',
  paste: 'V',
  selectAll: 'A',
  clear: 'K',
  emojis: isMac ? 'Ctrl+Cmd+Space' : '',

  // View menu
  reload: 'R',
  fullReload: isMac ? 'Shift+R' : 'F5',
  toggleDevTools: isMac ? 'Alt+I' : 'I',
  resetZoom: '0',
  zoomIn: 'plus',
  zoomOut: '-',

  // Plugins menu
  updatePlugins: isMac ? 'Shift+U' : 'U',

  // Window menu
  minimize: 'M',
  showPreviousTab: isMac ? 'Alt+Left' : '+Ctrl+PageDown',
  showNextTab: isMac ? 'Alt+Right' : '+Ctrl+PageUp',
  selectNextPane: 'Ctrl+Alt+Tab',
  selectPreviousPane: isMac ? 'Ctrl+Shift+Alt+Tab' : 'Ctrl+Z+Alt+Tab',
  enterFullScreen: isMac ? 'Ctrl+Cmd+F' : 'F11'
};

const mousetrap = { // lib/containers/hyper.js
  moveTo1: '1',
  moveTo2: '2',
  moveTo3: '3',
  moveTo4: '4',
  moveTo5: '5',
  moveTo6: '6',
  moveTo7: '7',
  moveTo8: '8',
  moveToLast: '9',

  // here `1`, `2` etc are used to "emulate" something like `moveLeft: ['...', '...', etc]`
  moveLeft1: isMac ? 'Shift+Left' : 'Z+Left',
  moveRight1: isMac ? 'Shift+Right' : 'Z+Right',
  moveLeft2: isMac ? 'Shift+{' : '{',
  moveRight2: isMac ? 'Shift+}' : '}',
  moveLeft3: 'Alt+Left',
  moveRight3: 'Alt+Right',
  moveLeft4: isMac ? 'Ctrl+Shift+Tab' : 'Z+Tab',
  moveRight4: 'Ctrl+Tab',

  // here we add `+` at the beginning to prevent the prefix from being added
  moveWordLeft: isMac ? '+Alt+Left' : '+Ctrl+Left',
  moveWordRight: isMac ? '+Alt+Right' : '+Ctrl+Right',
  deleteWordLeft: '+Alt+Backspace',
  deleteWordRight: '+Alt+Delete',
  deleteLine: 'Backspace',
  moveToStart: 'Left',
  moveToEnd: 'Right',
  selectAll: 'A'
};

const allAccelerators = Object.assign({}, applicationMenu, mousetrap);
const cache = [];
// ^ here we store the shortcuts so we don't need to
// look into the `allAccelerators` everytime

for (const key in allAccelerators) {
  if ({}.hasOwnProperty.call(allAccelerators, key)) {
    let value = allAccelerators[key];
    if (value) {
      if (value.startsWith('+')) {
        // we don't need to add the prefix to accelerators starting with `+`
        value = value.slice(1);
      } else if (!value.startsWith('Ctrl')) { // nor to the ones starting with `Ctrl`
        value = `${prefix}+${value}`;
      }
      cache.push(value.toLowerCase());
      allAccelerators[key] = value;
    }
  }
}

// decides if a keybard event is a Hyper Accelerator
function isAccelerator(e) {
  let keys = [];
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    // all accelerators needs Ctrl or Cmd or Alt
    return false;
  }

  if (e.ctrlKey) {
    keys.push('ctrl');
  }
  if (e.metaKey && isMac) {
    keys.push('cmd');
  }
  if (e.shiftKey) {
    keys.push('shift');
  }
  if (e.altKey) {
    keys.push('alt');
  }

  if (e.key === ' ') {
    keys.push('space');
  } else {
    // we need `toLowerCase` for when the shortcut has `shift`
    // we need to replace `arrow` when the shortcut uses the arrow keys
    keys.push(e.key.toLowerCase().replace('arrow', ''));
  }

  keys = keys.join('+');
  return cache.includes(keys);
}

module.exports.isAccelerator = isAccelerator;
module.exports.accelerators = allAccelerators;
