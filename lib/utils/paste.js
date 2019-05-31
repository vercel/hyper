import {clipboard} from 'electron';
import plist from 'plist';

const getPath = platform => {
  switch (platform) {
    case 'darwin': {
      if (clipboard.has('NSFilenamesPboardType')) {
        // Parse plist file containing the path list of copied files
        const list = plist.parse(clipboard.read('NSFilenamesPboardType'));
        return "'" + list.join("' '") + "'";
      } else {
        return null;
      }
    }
    case 'win32': {
      const filepath = clipboard.read('FileNameW');
      return filepath.replace(new RegExp(String.fromCharCode(0), 'g'), '');
    }
    // Linux already pastes full path
    default:
      return null;
  }
};

export default function processClipboard() {
  return getPath(process.platform);
}
