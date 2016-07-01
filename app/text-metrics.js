const mem = new Map();
export default function getTextMetrics (family, fontSize, lineHeight) {
  const id = family + '#' + fontSize + '#' + lineHeight;
  const memd = mem.get(id);
  if (memd) return memd;
  const el = document.createElement('span');
  const style = el.style;
  style.display = 'inline-block';
  style.fontFamily = family;
  style.fontSize = fontSize;
  style.lineHeight = lineHeight;
  el.innerText = 'X';
  document.body.appendChild(el);
  const { width, height } = el.getBoundingClientRect();
  const ret = { width, height };
  document.body.removeChild(el);
  mem.set(id, ret);
  console.log('text metrics calculated for', family, fontSize, lineHeight, ret);
  return ret;
}
