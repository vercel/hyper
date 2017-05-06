module.exports = {
  availableExtensions: new Set([
    'onApp', 'onWindow', 'onRendererWindow', 'onUnload', 'middleware',
    'reduceUI', 'reduceSessions', 'reduceTermGroups',
    'decorateMenu', 'decorateTerm', 'decorateHyper',
    'decorateHyperTerm', // for backwards compatibility with hyperterm
    'decorateHeader', 'decorateTerms', 'decorateTab',
    'decorateNotification', 'decorateNotifications',
    'decorateTabs', 'decorateConfig', 'decorateEnv', 'decorateSearchbox',
    'decorateTermGroup', 'decorateSplitPane', 'getTermProps',
    'getTabProps', 'getTabsProps', 'getTermGroupProps',
    'mapHyperTermState', 'mapTermsState',
    'mapHeaderState', 'mapSearchboxState', 'mapNotificationsState',
    'mapHyperTermDispatch', 'mapTermsDispatch', 'mapSearchboxDispatch',
    'mapHeaderDispatch', 'mapNotificationsDispatch',
    'extendKeymaps'
  ])
};
