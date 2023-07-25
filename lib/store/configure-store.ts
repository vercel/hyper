import configureStoreForDevelopment from './configure-store.dev';
import configureStoreForProduction from './configure-store.prod';

const configureStore = () => {
  if (process.env.NODE_ENV === 'production') {
    return configureStoreForProduction();
  }

  return configureStoreForDevelopment();
};
export default configureStore;
