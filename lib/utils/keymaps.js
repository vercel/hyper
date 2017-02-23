import {remote} from 'electron';

// TODO make isCommads work...
const keymaps = remote.require('./keymaps');
console.log(keymaps.commands);
