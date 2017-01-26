/**
 * Fit terminal columns and rows to the dimensions of its DOM element.
 *
 * ## Approach
 * - Rows: Truncate the division of the terminal parent element height by the terminal row height.
 *
 * - Columns: Truncate the division of the terminal parent element width by the terminal character
 * width (apply display: inline at the terminal row and truncate its width with the current
 * number of columns).
 * @module xterm/addons/fit/fit
 * @license MIT
 */
(function (fit) {
    if (typeof exports === 'object' && typeof module === 'object') {
        /*
         * CommonJS environment
         */
        module.exports = fit(require('../../xterm'));
    }
    else if (typeof define == 'function') {
        /*
         * Require.js is available
         */
        define(['../../xterm'], fit);
    }
    else {
        /*
         * Plain browser environment
         */
        fit(window.Terminal);
    }
})(function (Xterm) {
    var exports = {};
    exports.proposeGeometry = function (term) {
        var parentElementStyle = window.getComputedStyle(term.element.parentElement), parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height')), parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')) - 17), elementStyle = window.getComputedStyle(term.element), elementPaddingVer = parseInt(elementStyle.getPropertyValue('padding-top')) + parseInt(elementStyle.getPropertyValue('padding-bottom')), elementPaddingHor = parseInt(elementStyle.getPropertyValue('padding-right')) + parseInt(elementStyle.getPropertyValue('padding-left')), availableHeight = parentElementHeight - elementPaddingVer, availableWidth = parentElementWidth - elementPaddingHor, container = term.rowContainer, subjectRow = term.rowContainer.firstElementChild, contentBuffer = subjectRow.innerHTML, characterHeight, rows, characterWidth, cols, geometry;
        subjectRow.style.display = 'inline';
        subjectRow.innerHTML = 'W'; // Common character for measuring width, although on monospace
        characterWidth = subjectRow.getBoundingClientRect().width;
        subjectRow.style.display = ''; // Revert style before calculating height, since they differ.
        characterHeight = parseInt(subjectRow.offsetHeight);
        subjectRow.innerHTML = contentBuffer;
        rows = parseInt(availableHeight / characterHeight);
        cols = parseInt(availableWidth / characterWidth);
        geometry = { cols: cols, rows: rows };
        return geometry;
    };
    exports.fit = function (term) {
        var geometry = exports.proposeGeometry(term);
        term.resize(geometry.cols, geometry.rows);
    };
    Xterm.prototype.proposeGeometry = function () {
        return exports.proposeGeometry(this);
    };
    Xterm.prototype.fit = function () {
        return exports.fit(this);
    };
    return exports;
});
//# sourceMappingURL=fit.js.map