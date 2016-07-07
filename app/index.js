import { render } from 'react-dom';
import HyperTerm from './hyperterm';
import React from 'react';
import Config from './config';

require('./css/hyperterm.css');
require('./css/tabs.css');

render(<Config><HyperTerm /></Config>, document.getElementById('mount'));
