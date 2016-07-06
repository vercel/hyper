import { render } from 'react-dom';
import HyperTerm from './hyperterm';
import React from 'react';
import JsonConfig from './json-config';

require('./css/hyperterm.css');
require('./css/tabs.css');

render(
  <JsonConfig path='~/.hyperterm.json' defaults={{ fontSize: 12 }}>
    <HyperTerm />
  </JsonConfig>,
  document.getElementById('mount')
);
