import { render } from 'react-dom';
import HyperTerm from './hyperterm';
import React from 'react';

require('./css/hyperterm.css');
require('./css/tabs.css');

render(<HyperTerm />, document.getElementById('mount'));
