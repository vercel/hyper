/**
 * This module provides methods for attaching a terminal to a terminado WebSocket stream.
 *
 * @module xterm/addons/terminado/terminado
 * @license MIT
 */
(function (attach) {
    if (typeof exports === 'object' && typeof module === 'object') {
        /*
         * CommonJS environment
         */
        module.exports = attach(require('../../xterm'));
    }
    else if (typeof define == 'function') {
        /*
         * Require.js is available
         */
        define(['../../xterm'], attach);
    }
    else {
        /*
         * Plain browser environment
         */
        attach(window.Terminal);
    }
})(function (Xterm) {
    'use strict';
    var exports = {};
    /**
     * Attaches the given terminal to the given socket.
     *
     * @param {Xterm} term - The terminal to be attached to the given socket.
     * @param {WebSocket} socket - The socket to attach the current terminal.
     * @param {boolean} bidirectional - Whether the terminal should send data
     *                                  to the socket as well.
     * @param {boolean} buffered - Whether the rendering of incoming data
     *                             should happen instantly or at a maximum
     *                             frequency of 1 rendering per 10ms.
     */
    exports.terminadoAttach = function (term, socket, bidirectional, buffered) {
        bidirectional = (typeof bidirectional == 'undefined') ? true : bidirectional;
        term.socket = socket;
        term._flushBuffer = function () {
            term.write(term._attachSocketBuffer);
            term._attachSocketBuffer = null;
            clearTimeout(term._attachSocketBufferTimer);
            term._attachSocketBufferTimer = null;
        };
        term._pushToBuffer = function (data) {
            if (term._attachSocketBuffer) {
                term._attachSocketBuffer += data;
            }
            else {
                term._attachSocketBuffer = data;
                setTimeout(term._flushBuffer, 10);
            }
        };
        term._getMessage = function (ev) {
            var data = JSON.parse(ev.data);
            if (data[0] == "stdout") {
                if (buffered) {
                    term._pushToBuffer(data[1]);
                }
                else {
                    term.write(data[1]);
                }
            }
        };
        term._sendData = function (data) {
            socket.send(JSON.stringify(['stdin', data]));
        };
        term._setSize = function (size) {
            socket.send(JSON.stringify(['set_size', size.rows, size.cols]));
        };
        socket.addEventListener('message', term._getMessage);
        if (bidirectional) {
            term.on('data', term._sendData);
        }
        term.on('resize', term._setSize);
        socket.addEventListener('close', term.terminadoDetach.bind(term, socket));
        socket.addEventListener('error', term.terminadoDetach.bind(term, socket));
    };
    /**
     * Detaches the given terminal from the given socket
     *
     * @param {Xterm} term - The terminal to be detached from the given socket.
     * @param {WebSocket} socket - The socket from which to detach the current
     *                             terminal.
     */
    exports.terminadoDetach = function (term, socket) {
        term.off('data', term._sendData);
        socket = (typeof socket == 'undefined') ? term.socket : socket;
        if (socket) {
            socket.removeEventListener('message', term._getMessage);
        }
        delete term.socket;
    };
    /**
     * Attaches the current terminal to the given socket
     *
     * @param {WebSocket} socket - The socket to attach the current terminal.
     * @param {boolean} bidirectional - Whether the terminal should send data
     *                                  to the socket as well.
     * @param {boolean} buffered - Whether the rendering of incoming data
     *                             should happen instantly or at a maximum
     *                             frequency of 1 rendering per 10ms.
     */
    Xterm.prototype.terminadoAttach = function (socket, bidirectional, buffered) {
        return exports.terminadoAttach(this, socket, bidirectional, buffered);
    };
    /**
     * Detaches the current terminal from the given socket.
     *
     * @param {WebSocket} socket - The socket from which to detach the current
     *                             terminal.
     */
    Xterm.prototype.terminadoDetach = function (socket) {
        return exports.terminadoDetach(this, socket);
    };
    return exports;
});
//# sourceMappingURL=terminado.js.map