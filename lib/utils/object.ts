// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-return */
const valsCache = new WeakMap();

export function values(imm: Record<string, any>) {
  if (!valsCache.has(imm)) {
    valsCache.set(imm, Object.values(imm));
  }
  return valsCache.get(imm);
}

const keysCache = new WeakMap();
export function keys(imm: Record<string, any>) {
  if (!keysCache.has(imm)) {
    keysCache.set(imm, Object.keys(imm));
  }
  return keysCache.get(imm);
}

export const ObjectTypedKeys = <T extends object>(obj: T) => {
  return Object.keys(obj) as (keyof T)[];
};
