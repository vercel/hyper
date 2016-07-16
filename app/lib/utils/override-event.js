const config = require('./config');

let enableBell = config.getConfig().enableBell;

config.subscribe(() => {
  // listen on confg update to enable/disable bell
  enableBell = config.getConfig().enableBell;
});

export default function shouldIgnoreEvent (data) {
  switch(data) {
    case '\u0007':
        return !enableBell;
  }

  return false;
}
