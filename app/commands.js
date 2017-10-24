const commands = {
    'pane:splitVertical': (focusedWindow) => {
        focusedWindow.rpc.emit('split request vertical');
    }
}

exports.execCommand = (command, focusedWindow) => {
    const fn = commands[command];
    if (fn) {
        fn(focusedWindow);
    }
};