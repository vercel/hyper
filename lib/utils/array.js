export function last(arr) {
  return arr[arr.length - 1];
}

export const arrBuf2Base64 = buffer => {
  const binaryString = String.fromCharCode.apply(null, new Uint8Array(buffer));
  const base64Data = 'base64,' + window.btoa(binaryString);
  return base64Data;
};
