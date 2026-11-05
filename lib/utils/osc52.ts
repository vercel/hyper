const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/**
 * Decode an OSC 52 system clipboard write.
 *
 * Hyper intentionally handles writes only. Clipboard reads would expose the
 * host clipboard to processes running in the terminal.
 */
export function decodeOsc52Clipboard(data: string): string | undefined {
  const separator = data.indexOf(';');
  if (separator < 0 || data.slice(0, separator) !== 'c') {
    return undefined;
  }

  const encoded = data.slice(separator + 1);
  if (encoded === '?') {
    return undefined;
  }

  if (encoded === '!') {
    return '';
  }

  if (!BASE64_PATTERN.test(encoded)) {
    return undefined;
  }

  const decoded = Buffer.from(encoded, 'base64');
  if (decoded.toString('base64') !== encoded) {
    return undefined;
  }

  return decoded.toString('utf8');
}

export function handleOsc52Clipboard(data: string, writeClipboard: (text: string) => void): boolean {
  const text = decodeOsc52Clipboard(data);
  if (text === undefined) {
    return false;
  }

  writeClipboard(text);
  return true;
}
