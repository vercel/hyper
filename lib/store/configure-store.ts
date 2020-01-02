import configureStoreForProduction from './configure-store.prod';
import configureStoreForDevelopment from './configure-store.dev';

export default () => {
  if (process.env.NODE_ENV === 'production') {
    return configureStoreForProduction();
  }

  return configureStoreForDevelopment();
};
