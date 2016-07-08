import { render } from 'react-dom';
import HyperTerm from './hyperterm';
import React from 'react';
import Config from './config';
import Plugins from './plugins';

require('./css/hyperterm.css');
require('./css/tabs.css');

const app = <Config>
  <Plugins>
    <HyperTerm />
  </Plugins>
</Config>;

render(app, document.getElementById('mount'));
