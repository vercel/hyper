export function last(arr) {
  return arr[arr.length - 1];
}

export const arrBuf2Base64 = buffer => {
  let base64String = null;
  try {
    base64String = Buffer.from(buffer).toString('base64');
  } catch (err) {
    //eslint-disable-next-line no-console
    console.error('Could not use the file specified:', err);
  }

  return base64String;
};
