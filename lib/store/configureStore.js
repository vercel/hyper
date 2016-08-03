import configureStoreForProduction from './configureStore.prod';
import configureStoreForDevelopment from './configureStore.dev';

export default () => {
  if (process.env.NODE_ENV === 'production') {
    return configureStoreForProduction();
  } else {
    return configureStoreForDevelopment();
  }
};
