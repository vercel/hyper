import Xt from '../../xterm/xterm';

Xt.prototype.proposeGeometry  = function(term) {
  const ELE = term.element.parentElement.parentElement;
  const styles = window.getComputedStyle(ELE);
  const avH = parseInt(styles.getPropertyValue('height'));
  const avW = parseInt(styles.getPropertyValue('width'));
  
  const ELE2 = term.element.parentElement;
  const styles2 = window.getComputedStyle(ELE2);
  
  
  var parentElementStyle = window.getComputedStyle(term.element.parentElement),
        parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height')),
        parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')) - 17),
        elementStyle = window.getComputedStyle(term.element),
        elementPaddingVer = parseInt(elementStyle.getPropertyValue('padding-top')) + parseInt(elementStyle.getPropertyValue('padding-bottom')),
        elementPaddingHor = parseInt(elementStyle.getPropertyValue('padding-right')) + parseInt(elementStyle.getPropertyValue('padding-left')),
        availableHeight = parentElementHeight - elementPaddingVer,
        availableWidth = parentElementWidth - elementPaddingHor,
        container = term.rowContainer,
        subjectRow = term.rowContainer.firstElementChild,
        contentBuffer = subjectRow.innerHTML,
        characterHeight,
        rows,
        characterWidth,
        cols,
        geometry;
  
    subjectRow.style.display = 'inline';
    subjectRow.innerHTML = 'W'; // Common character for measuring width, although on monospace
    characterWidth = subjectRow.getBoundingClientRect().width;
    subjectRow.style.display = ''; // Revert style before calculating height, since they differ.
    characterHeight = parseInt(subjectRow.offsetHeight);
    subjectRow.innerHTML = contentBuffer;
  
  
    const ROw = parseInt(avH / characterHeight);
    const COl = parseInt(avW / characterWidth);
    // console.log('COl: ',COl,'ROw:', ROw);
    // console.log('avH: ',(avH / characterHeight),'avW:', (avW / characterWidth));
    
    rows = parseInt(availableHeight / characterHeight);
    cols = parseInt(availableWidth / characterWidth);
    
    // console.log('cols:', cols,'rows:', rows);
  
    geometry = {cols: COl, rows: ROw};
    return geometry;
}

Xt.prototype.fit = function() {
  const geometry = this.proposeGeometry(this);
  this.resize(geometry.cols, geometry.rows);
}



export default Xt

// class Xt {
//   constructor(){
//     this.terminal = new Terminal();
//   }
//   
//   proposeGeometry(term) {
//       var parentElementStyle = window.getComputedStyle(term.element.parentElement), parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height')), parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')) - 17), elementStyle = window.getComputedStyle(term.element), elementPaddingVer = parseInt(elementStyle.getPropertyValue('padding-top')) + parseInt(elementStyle.getPropertyValue('padding-bottom')), elementPaddingHor = parseInt(elementStyle.getPropertyValue('padding-right')) + parseInt(elementStyle.getPropertyValue('padding-left')), availableHeight = parentElementHeight - elementPaddingVer, availableWidth = parentElementWidth - elementPaddingHor, container = term.rowContainer, subjectRow = term.rowContainer.firstElementChild, contentBuffer = subjectRow.innerHTML, characterHeight, rows, characterWidth, cols, geometry;
//       subjectRow.style.display = 'inline';
//       subjectRow.innerHTML = 'W'; // Common character for measuring width, although on monospace
//       characterWidth = subjectRow.getBoundingClientRect().width;
//       subjectRow.style.display = ''; // Revert style before calculating height, since they differ.
//       characterHeight = parseInt(subjectRow.offsetHeight);
//       subjectRow.innerHTML = contentBuffer;
//       rows = parseInt(availableHeight / characterHeight);
//       cols = parseInt(availableWidth / characterWidth);
//       geometry = { cols: cols, rows: rows };
//       return geometry;
//   }
//   
//   fit() {
//     let geometry = this.proposeGeometry(this.terminal);
//     console.log(geometry);
//     this.terminal.resize(geometry.cols, geometry.rows);
//   }
//   
//   open(ref) {
//     this.terminal.open(ref);
//   }
// };
// 
// export default Terminal;