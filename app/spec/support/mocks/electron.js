const paths = {
  plugins: {
    concat: () => ['my/path', 'my/local/path']
  }
};

const plugins = {
  getBasePaths: () => ({
    path: '/my/path',
    localPath: '/my/local/path'
  }),
  getPaths: () => paths
};

export default {
  remote: {
    require: () => plugins
  }
};
