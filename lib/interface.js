import {webFrame} from 'electron';
import {Provider} from 'react-redux';
import React from 'react';
import {render} from 'react-dom';
import Com from './communication/com';
import HyperConnector from './connector/hyper';

webFrame.setZoomLevelLimits(1, 1); // Disable pinch zoom

const com = new Com();

const app = render(
  <Provider store={com.store}>
    <HyperConnector/>
  </Provider>,
  document.getElementById('mount')
);

com.reload(app);
