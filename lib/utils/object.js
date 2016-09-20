import vals from 'object-values';

const valsCache = new WeakMap();
export function values(imm) {
  if (!valsCache.has(imm)) {
    valsCache.set(imm, vals(imm));
  }
  return valsCache.get(imm);
}

const keysCache = new WeakMap();
export function keys(imm) {
  if (!keysCache.has(imm)) {
    keysCache.set(imm, Object.keys(imm));
  }
  return keysCache.get(imm);
}
