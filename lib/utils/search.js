function getRowNodeFromNode(node) {
  while (node && !('rowIndex' in node)) {
    node = node.parentNode;
  }

  return node;
}

function findNextFrom(terminal, searchTerm, selection = {}, options = {}) {
  const {startRow} = selection;
  let {startOffset} = selection;
  const rowCount = terminal.getRowCount();

  let foundIndex = -1;
  let foundRow;
  for (let i = 0; i <= rowCount; i++) {
    // increment/decrement foundRow while ensuring it's always 0 <= foundRow < rowCount
    foundRow = (startRow + (rowCount * 2) + (options.direction * i)) % rowCount;
    const rowText = terminal.getRowText(foundRow);
    foundIndex = rowText[options.direction === 1 ? 'indexOf' : 'lastIndexOf'](searchTerm, startOffset);
    if (foundIndex !== -1 && foundIndex !== startOffset) {
      break;
    }
    startOffset = undefined;
  }

  if (foundIndex === -1) {
    return null;
  }

  return {
    index: foundIndex,
    row: foundRow
  };
}

// find a searchTerm, returning the row and index it was found at
export default function find(terminal, searchTerm, options = {}) {
  const direction = options.direction === -1 ? -1 : 1;
  const sel = terminal.document_.defaultView.getSelection();

  const focusRowNode = getRowNodeFromNode(sel.focusNode);
  const anchorRowNode = getRowNodeFromNode(sel.anchorNode);
  const startRowNode = direction === 1 ? focusRowNode : anchorRowNode;

  const topRowIndex = terminal.scrollPort_.getTopRowIndex();
  const bottomRowIndex = terminal.scrollPort_.getBottomRowIndex(topRowIndex);
  const startRow = startRowNode ?
    startRowNode.rowIndex :
    (direction === 1 ? topRowIndex : bottomRowIndex);
  const selNodeOffset = (
    startRowNode &&
    startRowNode.textContent.indexOf((direction === 1 ? sel.focusNode : sel.anchorNode).textContent)
  ) || 0;
  const curRowOffset = selNodeOffset + (direction === 1 ? sel.focusOffset - 1 : sel.anchorOffset);

  const selection = {
    startRow,
    startOffset: curRowOffset
  };
  return findNextFrom(terminal, searchTerm, selection, {direction});
}
