import test from 'ava';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const proxyquire = require('proxyquire').noCallThru();

test('existsOnNpm() builds the url for non-scoped packages', (t) => {
  let getUrl: string;
  const {existsOnNpm} = proxyquire('../../cli/api', {
    got: {
      get(url: string) {
        getUrl = url;
        return Promise.resolve({
          body: {
            versions: []
          }
        });
      }
    },
    'registry-url': () => 'https://registry.npmjs.org/'
  });

  return existsOnNpm('pkg').then(() => {
    t.is(getUrl, 'https://registry.npmjs.org/pkg');
  });
});

test('existsOnNpm() builds the url for scoped packages', (t) => {
  let getUrl: string;
  const {existsOnNpm} = proxyquire('../../cli/api', {
    got: {
      get(url: string) {
        getUrl = url;
        return Promise.resolve({
          body: {
            versions: []
          }
        });
      }
    },
    'registry-url': () => 'https://registry.npmjs.org/'
  });

  return existsOnNpm('@scope/pkg').then(() => {
    t.is(getUrl, 'https://registry.npmjs.org/@scope%2fpkg');
  });
});
