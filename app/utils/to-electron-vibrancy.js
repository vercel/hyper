module.exports = vibrancyType => {
  const validTypes = [
    'appearance-based',
    'light',
    'dark',
    'titlebar',
    'selection',
    'menu',
    'popover',
    'sidebar',
    'medium-light',
    'ultra-dark'
  ];

  if (process.platform === 'darwin' &&
      typeof vibrancyType === 'string' &&
      validTypes.includes(vibrancyType.toLowerCase())) {
    return vibrancyType;
  }

  return '';
};
