import Xt from '../../xterm/xterm';

Xt.prototype.proposeGeometry = function () {
  const term = this;
  const styles = window.getComputedStyle(term.element.parentElement.parentElement);
  const avH = parseInt(styles.getPropertyValue('height'), 10);
  const avW = parseInt(styles.getPropertyValue('width'), 10);
  const container = term.rowContainer;
  const subjectRow = container.firstElementChild;
  const contentBuffer = subjectRow.innerHTML;

  subjectRow.style.display = 'inline';
  subjectRow.innerHTML = 'W'; // Common character for measuring width, although on monospace
  const characterWidth = subjectRow.getBoundingClientRect().width;
  subjectRow.style.display = ''; // Revert style before calculating height, since they differ.
  const characterHeight = parseInt(subjectRow.offsetHeight, 10);
  subjectRow.innerHTML = contentBuffer;

  return {
    cols: parseInt(avW / characterWidth, 10),
    rows: parseInt(avH / characterHeight, 10)
  };
};

Xt.prototype.fit = function () {
  const geometry = this.proposeGeometry();
  this.resize(geometry.cols, geometry.rows);
};

export default Xt;
