import { render } from 'react-dom';
import HyperTerm from './hyperterm';
import React from 'react';
import Store from './store';

require('./css/hyperterm.css');
require('./css/tabs.css');

render(
  <Store path='~/.hyperterm.json'>
    <HyperTerm />
  </Store>,
  document.getElementById('mount')
);
