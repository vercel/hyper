export function last(arr) {
  return arr[arr.length - 1];
}

export const arrBuf2Base64 = buffer => {
  let base64Data = null;
  try {
    const binaryString = String.fromCharCode.apply(null, new Uint8Array(buffer));
    base64Data = 'base64,' + window.btoa(binaryString);
  } catch (err) {
    if (err instanceof RangeError) {
      //eslint-disable-next-line no-console
      console.warn('The file was liekly too large to use for the "bell" sound:\n', err);
    } else {
      //eslint-disable-next-line no-console
      console.error('Could not use the file specified:', err);
    }
  }

  return base64Data;
};
