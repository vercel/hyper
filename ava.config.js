export default {
  files: ['test/unit/*'],
  babel: {
    compileEnhancements: false,
    compileAsTests: ['**/testUtils/**/*']
  },
  extensions: ['ts'],
  require: ['ts-node/register/transpile-only']
};
