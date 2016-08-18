//  clear selection range of current selected term view
//  Fix event when terminal text is selected and keyboard action is invoked
exports.clear = function (terminal) {
  terminal.document_.getSelection().removeAllRanges();
};

// Use selection expand upon dblclick
exports.expand = function (terminal) {
  terminal.screen_.expandSelection(terminal.document_.getSelection());
};
