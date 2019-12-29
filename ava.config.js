export default {
  files: ['test/unit/*'],
  helpers: ['**/testUtils/**/*'],
  compileEnhancements: false,
  extensions: ['ts'],
  require: ['ts-node/register/transpile-only']
};
