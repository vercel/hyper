const { app } = require('electron');

const commands = {
    'window:new': () => {
        // Ensuring that rpc call will be consumed before
        setTimeout(app.createWindow, 0);
    },
    'pane:splitVertical': (focusedWindow) => {
        focusedWindow.rpc.emit('split request vertical');
    },
    'pane:splitHorizontal': (focusedWindow) => {
        focusedWindow.rpc.emit('split request horizontal');
    }
}

exports.execCommand = (command, focusedWindow) => {
    const fn = commands[command];
    if (fn) {
        fn(focusedWindow);
    }
};