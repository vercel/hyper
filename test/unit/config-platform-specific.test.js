import test from 'ava';
import platformSpecific from '../../app/config/platform-specific';

const defaultCfg = {
  shell: 'custom-shell',
  env: {
    custom: 'env'
  },
  shellArgs: ['custom-shell-arg']
};

const getPlatformConfig = platform => {
  return {
    shell: {
      [platform]: defaultCfg.shell
    },
    env: {
      [platform]: defaultCfg.env
    },
    shellArgs: {
      [platform]: defaultCfg.shellArgs
    }
  };
};

test(`supports platform agnostic config`, t => {
  const value = platformSpecific(defaultCfg);
  t.deepEqual(value, defaultCfg);
});

let platform = 'linux';
if (process.platform === 'win32') {
  platform = 'windows';
} else if (process.platform === 'darwin') {
  platform = 'osx';
}

test(`supports ${platform} platform config`, t => {
  const value = platformSpecific(getPlatformConfig(platform));
  t.deepEqual(value, defaultCfg);
});
