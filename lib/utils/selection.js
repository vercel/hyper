import {hterm} from 'hterm-umdjs';

//  Clear selection range of current selected term view
//  Fix event when terminal text is selected and keyboard action is invoked
export function clear(terminal) {
  terminal.document_.getSelection().removeAllRanges();
}

// Use selection extend upon dblclick
export function extend(terminal) {
  const sel = terminal.document_.getSelection();

  // Test if focusNode exist and nodeName is #text
  if (sel.focusNode && sel.focusNode.nodeName === '#text') {
    terminal.screen_.expandSelection(sel);
    if (terminal.copyOnSelect) {
      terminal.copyStringToClipboard(sel);
    }
  }
}

// Fix a bug in ScrollPort selectAll behavior
// Select all rows in the viewport
export function all(terminal) {
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
}

function selectRowNoScroll(terminal, row, startIndex, endIndex) {
  const sel = terminal.document_.defaultView.getSelection();
  const range = terminal.document_.createRange();
  const rowNode = terminal.getRowNode(row);

  // we need to consider that our indices might overflow the current row
  const startNodeAndOffset = getNodeAndOffsetWithOverflow(rowNode, startIndex);
  const endNodeAndOffset = getNodeAndOffsetWithOverflow(rowNode, endIndex);

  if (startNodeAndOffset && endNodeAndOffset) {
    range.setStart(startNodeAndOffset[0], startNodeAndOffset[1]);
    range.setEnd(endNodeAndOffset[0], endNodeAndOffset[1]);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// select (highlight) between 2 indices of a row
export function selectRow(terminal, selection = {}, options = {}) {
  const {row, startIndex, endIndex} = selection;
  if (options.scroll) {
    terminal.scrollPort_.scrollTo(row, 5);
    terminal.scrollPort_.scheduleRedraw();

    // Make sure the redraw has happened before attempting to highlight the result
    setTimeout(() => selectRowNoScroll(terminal, row, startIndex, endIndex), 0);
  } else {
    selectRowNoScroll(terminal, row, startIndex, endIndex);
  }
}

/*
 * Copy-pasted from hterm's hterm.Screen.prototype.getNodeAndOffsetWithOverflow_
 *
 *
 * Returns the node and offset corresponding to position within line.
 * Supports line overflow.
 *
 * @param {Node} row X-ROW at beginning of line.
 * @param {integer} position Position within line to retrieve node and offset.
 * @return {Array} Two element array containing node and offset respectively.
 */
function getNodeAndOffsetWithOverflow(row, position) {
  while (row && position > hterm.TextAttributes.nodeWidth(row)) {
    if (row.hasAttribute('line-overflow') && row.nextSibling) {
      position -= hterm.TextAttributes.nodeWidth(row);
      row = row.nextSibling;
    } else {
      return -1;
    }
  }
  return getNodeAndOffsetWithinRow(row, position);
}

/*
 * Copy-pasted from hterm's hterm.Screen.prototype.getNodeAndOffsetWithinRow_
 *
 *
 * Returns the node and offset corresponding to position within row.
 * Does not support line overflow.
 *
 * @param {Node} row X-ROW to get position within.
 * @param {integer} position Position within row to retrieve node and offset.
 * @return {Array} Two element array containing node and offset respectively.
 */
function getNodeAndOffsetWithinRow(row, position) {
  for (let i = 0; i < row.childNodes.length; i++) {
    const node = row.childNodes[i];
    const nodeTextWidth = hterm.TextAttributes.nodeWidth(node);
    if (position <= nodeTextWidth) {
      if (node.nodeName === 'SPAN') {
        /* Drill down to node contained by SPAN. */
        return getNodeAndOffsetWithinRow(node, position);
      }
      return [node, position];
    }
    position -= nodeTextWidth;
  }
  return null;
}
