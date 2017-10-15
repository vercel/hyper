import {clipboard} from 'electron';

const getPath = platform => {
  switch (platform) {
    case 'darwin': {
      const filepath = clipboard.read('public.file-url');
      return filepath.replace('file://', '');
    }
    case 'win32': {
      const filepath = clipboard.read('FileNameW');
      return filepath.replace(new RegExp(String.fromCharCode(0), 'g'), '');
    }
    case 'linux': {
      return '';
    }
    default:
      return '';
  }
};

export default function processClipboard() {
  return getPath(process.platform);
}
