const _extensions = new Set([
  'onApp', 'onWindow', 'onRendererWindow', 'onUnload', 'middleware',
  'reduceUI', 'reduceSessions', 'reduceTermGroups',
  'decorateMenu', 'decorateTerm', 'decorateHyper',
  'decorateHyperTerm', // for backwards compatibility with hyperterm
  'decorateHeader', 'decorateTerms', 'decorateTab',
  'decorateNotification', 'decorateNotifications',
  'decorateTabs', 'decorateConfig', 'decorateEnv',
  'decorateTermGroup', 'decorateSplitPane', 'getTermProps',
  'getTabProps', 'getTabsProps', 'getTermGroupProps',
  'mapHyperTermState', 'mapTermsState',
  'mapHeaderState', 'mapNotificationsState',
  'mapHyperTermDispatch', 'mapTermsDispatch',
  'mapHeaderDispatch', 'mapNotificationsDispatch',
  'extendKeymaps'
]);

module.exports = _extensions;
