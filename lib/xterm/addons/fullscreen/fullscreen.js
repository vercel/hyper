/**
 * Fullscreen addon for xterm.js
 * @module xterm/addons/fullscreen/fullscreen
 * @license MIT
 */
(function (fullscreen) {
    if (typeof exports === 'object' && typeof module === 'object') {
        /*
         * CommonJS environment
         */
        module.exports = fullscreen(require('../../xterm'));
    }
    else if (typeof define == 'function') {
        /*
         * Require.js is available
         */
        define(['../../xterm'], fullscreen);
    }
    else {
        /*
         * Plain browser environment
         */
        fullscreen(window.Terminal);
    }
})(function (Xterm) {
    var exports = {};
    /**
     * Toggle the given terminal's fullscreen mode.
     * @param {Xterm} term - The terminal to toggle full screen mode
     * @param {boolean} fullscreen - Toggle fullscreen on (true) or off (false)
     */
    exports.toggleFullScreen = function (term, fullscreen) {
        var fn;
        if (typeof fullscreen == 'undefined') {
            fn = (term.element.classList.contains('fullscreen')) ? 'remove' : 'add';
        }
        else if (!fullscreen) {
            fn = 'remove';
        }
        else {
            fn = 'add';
        }
        term.element.classList[fn]('fullscreen');
    };
    Xterm.prototype.toggleFullscreen = function (fullscreen) {
        exports.toggleFullScreen(this, fullscreen);
    };
    return exports;
});
//# sourceMappingURL=fullscreen.js.map