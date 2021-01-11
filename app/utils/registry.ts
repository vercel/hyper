export let Registry: typeof import('native-reg');

export const loadRegistry = () => {
  if (process.platform === 'win32') {
    if (!Registry) {
      try {
        Registry = require('native-reg');
      } catch (error) {
        console.error(error);
        return false;
      }
    }
    return true;
  }
  return false;
};
