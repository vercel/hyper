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

  if (validTypes.includes(vibrancyType) && process.platform === 'darwin') {
    return vibrancyType;
  }

  return '';
};
