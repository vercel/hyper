import {fileURLToPath} from 'url';

import {clipboard} from 'electron';

// Return strings across the remote bridge: ClipboardItems and Blobs stay in main.
export async function readClipboardFilePaths(platform = process.platform): Promise<string | null> {
  if (platform !== 'darwin' && platform !== 'win32') return null;

  const items = await clipboard.read();
  const item = items.find((entry) => entry.types.includes('text/uri-list'));
  if (!item) return null;

  const uris = await (await item.getType('text/uri-list')).text();
  const paths = uris
    .split(/\r?\n/)
    .filter((uri) => uri && !uri.startsWith('#'))
    .map((uri) => fileURLToPath(uri, {windows: platform === 'win32'}));

  if (!paths.length) return null;
  return platform === 'darwin'
    ? paths.map((path) => "'" + path.replace(/'/g, "'\\''") + "'").join(' ')
    : paths.join(' ');
}
