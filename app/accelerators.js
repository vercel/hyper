const platform = process.platform;

const isMac = platform === 'darwin';

const prefix = isMac ? 'Cmd' : 'Ctrl';

const applicationMenu = { // app/menu.js
  preferences: ',',
  quit: isMac ? 'Q' : '',

  // Shell/File menu
  newWindow: 'N',
  newTab: 'T',
  splitVertically: isMac ? 'D' : 'Shift+E',
  splitHorizontally: isMac ? 'Shift+D' : 'Shift+O',
  closeSession: 'W',
  closeWindow: 'Shift+W',

  // Edit menu
  undo: 'Z',
  redo: 'Shift+Z',
  cut: 'X',
  copy: isMac ? 'C' : 'Shift+C',
  paste: 'V',
  selectAll: 'A',
  clear: 'K',
  emojis: isMac ? 'Ctrl+Cmd+Space' : '',

  // View menu
  reload: 'R',
  fullReload: 'Shift+R',
  toggleDevTools: isMac ? 'Alt+I' : 'Shift+I',
  resetZoom: '0',
  zoomIn: 'plus',
  zoomOut: '-',

  // Plugins menu
  updatePlugins: 'Shift+U',

  // Window menu
  minimize: 'M',
  showPreviousTab: 'Alt+Left',
  showNextTab: 'Alt+Right',
  selectNextPane: 'Ctrl+Alt+Tab', // exception
  selectPreviousPane: 'Ctrl+Shift+Alt+Tab', // ditto
  enterFullScreen: isMac ? 'Ctrl+Cmd+F' : '' // ditto
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
  moveLeft1: 'Shift+Left',
  moveRight1: 'Shift+Right',
  moveLeft2: 'Shift+{',
  moveRight2: 'Shift+}',
  moveLeft3: 'Alt+Left',
  moveRight3: 'Alt+Right',
  moveLeft4: 'Ctrl+Shift+Tab',
  moveRight4: 'Ctrl+Tab',

  // here we add `+` at the beginning to prevent the prefix from being added
  moveWordLeft: '+Alt+Left',
  moveWordRight: '+Alt+Right',
  deleteWordLeft: '+Alt+Backspace',
  deleteWordRight: '+Alt+Delete',
  deleteLine: 'Backspace',
  moveToStart: 'Left',
  moveToEnd: 'Right',
  selectAll: 'A'
};

const allAccelerators = [];

for (const key in Object.assign({}, applicationMenu, mousetrap)) { // eslint-disable-line guard-for-in
  let value = applicationMenu[key] || mousetrap[key];
  if (value !== '' && !value.startsWith('Ctrl') && !value.startsWith('+')) { // we don't want to process those
    value = `${prefix}+${value}`;
    applicationMenu[key] = value;
  }
  if (value.startsWith('+')) {
    value = value.slice(1);
  }
  allAccelerators.push(value.toLowerCase());
}

// decides if a keybard event is a Hyper Accelerator
function isAccelerator(e) {
  let keys = [];
  console.log(e);
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
    keys.push(e.key.toLowerCase().replace('arrow', ''));
  }

  keys = keys.join('+');

  console.log(keys);
  console.log(allAccelerators.includes(keys));
  return allAccelerators.includes(keys);
}

module.exports.isAccelerator = isAccelerator;
