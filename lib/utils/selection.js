//  Clear selection range of current selected term view
//  Fix event when terminal text is selected and keyboard action is invoked
exports.clear = function (terminal) {
  terminal.document_.getSelection().removeAllRanges();
};

// Use selection extend upon dblclick
exports.extend = function (terminal) {
  const sel = terminal.document_.getSelection();

  // Test if focusNode exist and nodeName is #text
  if (sel.focusNode && sel.focusNode.nodeName === '#text') {
    terminal.screen_.expandSelection(sel);
    if (terminal.copyOnSelect) {
      terminal.copyStringToClipboard();
    }
  }
};

// Fix a bug in ScrollPort selectAll behavior
// Select all rows in the viewport
exports.all = function (terminal) {
  const scrollPort = terminal.scrollPort_;
  let firstRow;
  let lastRow;

  if (scrollPort.topFold_.nextSibling.rowIndex === 0) {
    firstRow = scrollPort.topFold_.nextSibling;
  } else {
    while (scrollPort.topFold_.previousSibling) {
      scrollPort.rowNodes_.removeChild(scrollPort.topFold_.previousSibling);
    }

    firstRow = scrollPort.fetchRowNode_(0);
    scrollPort.rowNodes_.insertBefore(firstRow, scrollPort.topFold_);
    scrollPort.syncRowNodesDimensions_();
  }

  const lastRowIndex = scrollPort.rowProvider_.getRowCount() - 1;

  if (scrollPort.bottomFold_.previousSibling.rowIndex === lastRowIndex) {
    lastRow = scrollPort.bottomFold_.previousSibling.rowIndex;
  } else {
    while (scrollPort.bottomFold_.nextSibling) {
      scrollPort.rowNodes_.removeChild(scrollPort.bottomFold_.nextSibling);
    }

    lastRow = scrollPort.fetchRowNode_(lastRowIndex);
    scrollPort.rowNodes_.appendChild(lastRow);
  }

  scrollPort.selection.sync();
};
