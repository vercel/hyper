import {require as remoteRequire} from '@electron/remote';

const {readClipboardFilePaths} = remoteRequire('./utils/clipboard') as typeof import('../../app/utils/clipboard');

export default function processClipboard() {
  return readClipboardFilePaths();
}
