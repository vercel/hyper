import Xt from '../../xterm/xterm';

Xt.prototype.proposeGeometry  = function(term) {
  const styles = window.getComputedStyle(term.element.parentElement.parentElement);
  const avH = parseInt(styles.getPropertyValue('height'));
  const avW = parseInt(styles.getPropertyValue('width'));
  const container = term.rowContainer;
  const subjectRow = container.firstElementChild;
  const contentBuffer = subjectRow.innerHTML;
  let characterHeight;
  let characterWidth;

  subjectRow.style.display = 'inline';
  subjectRow.innerHTML = 'W'; // Common character for measuring width, although on monospace
  characterWidth = subjectRow.getBoundingClientRect().width;
  subjectRow.style.display = ''; // Revert style before calculating height, since they differ.
  characterHeight = parseInt(subjectRow.offsetHeight);
  subjectRow.innerHTML = contentBuffer;

  return {
    cols: parseInt(avW / characterWidth),
    rows:  parseInt(avH / characterHeight)
  };
}

Xt.prototype.fit = function() {
  const geometry = this.proposeGeometry(this);
  this.resize(geometry.cols, geometry.rows);
}

export default Xt
