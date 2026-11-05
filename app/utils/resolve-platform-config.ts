import type {configOptions} from '../../typings/config';

type PlatformSuffix = 'Osx' | 'Windows' | 'Linux';

const PLATFORM_SUFFIX_MAP: Partial<Record<NodeJS.Platform, PlatformSuffix>> = {
  darwin: 'Osx',
  win32: 'Windows',
  linux: 'Linux'
};

export const resolvePlatformConfig = (
  config: configOptions,
  platform: NodeJS.Platform = process.platform
): configOptions => {
  const suffix = PLATFORM_SUFFIX_MAP[platform];
  if (!suffix) return config;

  const result = {...config};
  const shellKey = `shell${suffix}` as `shell${PlatformSuffix}`;
  const shellArgsKey = `shellArgs${suffix}` as `shellArgs${PlatformSuffix}`;
  const envKey = `env${suffix}` as `env${PlatformSuffix}`;

  if (result[shellKey] !== undefined) result.shell = result[shellKey]!;
  if (result[shellArgsKey] !== undefined) result.shellArgs = result[shellArgsKey]!;
  if (result[envKey] !== undefined) result.env = {...(result.env || {}), ...result[envKey]};

  return result;
};
