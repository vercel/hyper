export default {
  files: ['test/*'],
  babel: {
    compileEnhancements: false,
    compileAsTests: ['**/testUtils/**/*']
  },
  extensions: ['ts'],
  require: ['ts-node/register/transpile-only']
};
