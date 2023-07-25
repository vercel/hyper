import configureStoreForProduction from './configure-store.prod';
import configureStoreForDevelopment from './configure-store.dev';

const configureStore = () => {
  if (process.env.NODE_ENV === 'production') {
    return configureStoreForProduction();
  }

  return configureStoreForDevelopment();
};
export default configureStore;
