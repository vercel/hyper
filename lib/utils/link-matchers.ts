interface linkMatcher {
  regex: RegExp;
  matchIndex: number;
}

// Based on the regex used in xterm-addon-web-links
export const URLMatcher: linkMatcher = (() => {
  const protocolClause = '(https?:\\/\\/)';
  const domainCharacterSet = '[\\da-z\\.-]+';
  const negatedDomainCharacterSet = '[^\\da-z\\.-]+';
  const domainBodyClause = '(' + domainCharacterSet + ')';
  const tldClause = '([a-z\\.]{2,6})';
  const ipClause = '((\\d{1,3}\\.){3}\\d{1,3})';
  const localHostClause = '(localhost)';
  const portClause = '(:\\d{1,5})';
  const hostClause =
    '((' + domainBodyClause + '\\.' + tldClause + ')|' + ipClause + '|' + localHostClause + ')' + portClause + '?';
  const pathCharacterSet = '(\\/[\\/\\w\\.\\-%~:+@]*)*([^:"\'\\s])';
  const pathClause = '(' + pathCharacterSet + ')?';
  const queryStringHashFragmentCharacterSet = "[0-9\\w\\[\\]\\(\\)\\/\\?\\!#@$%&'*+,:;~\\=\\.\\-]*";
  const queryStringClause = '(\\?' + queryStringHashFragmentCharacterSet + ')?';
  const hashFragmentClause = '(#' + queryStringHashFragmentCharacterSet + ')?';
  const negatedPathCharacterSet = '[^\\/\\w\\.\\-%]+';
  const bodyClause = hostClause + pathClause + queryStringClause + hashFragmentClause;
  const start = '(?:^|' + negatedDomainCharacterSet + ')(';
  const end = ')($|' + negatedPathCharacterSet + ')';
  return {regex: new RegExp(start + protocolClause + bodyClause + end), matchIndex: 1};
})();

// Simple file url matcher
export const FileURLMatcher: linkMatcher = (() => {
  const protocolClause = '(file:\\/\\/)';
  const negatedDomainCharacterSet = '[^\\da-z\\.-]+';
  const pathCharacterSet = '(\\/[\\/\\w\\.\\-%~:+@]*)*([^:"\'\\s])';
  const pathClause = '(' + pathCharacterSet + ')';
  const negatedPathCharacterSet = '[^\\/\\w\\.\\-%]+';
  const bodyClause = pathClause;
  const start = '(?:^|' + negatedDomainCharacterSet + ')(';
  const end = ')($|' + negatedPathCharacterSet + ')';
  return {regex: new RegExp(start + protocolClause + bodyClause + end), matchIndex: 1};
})();
