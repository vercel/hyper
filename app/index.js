import { render } from 'react-dom';
import HyperTerm_ from './hyperterm';
import React from 'react';
import Config from './config';
import decorate from './plugins';

// make the component reload with plugin changes
const HyperTerm = decorate(HyperTerm_);

require('./css/hyperterm.css');
require('./css/tabs.css');

const app = <Config><HyperTerm /></Config>;
render(app, document.getElementById('mount'));
