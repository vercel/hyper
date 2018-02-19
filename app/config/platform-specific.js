const platformSpecificConfigs = ['shell', 'shellArgs', 'env'];

const getPlatformKey = () => {
  switch (process.platform) {
    case 'darwin':
      return 'osx';
    case 'win32':
      return 'windows';
    default:
      return 'linux';
  }
};

const getValueForPlatform = (platform, cfg, key) => {
  const value = cfg[key];

  if (value && typeof value === 'object' && value[platform]) {
    return value[platform];
  }

  return value;
};

module.exports = cfg => {
  const platform = getPlatformKey();

  for (const config of platformSpecificConfigs) {
    cfg[config] = getValueForPlatform(platform, cfg, config);
  }

  return cfg;
};
