import mockery from 'mockery';
import electronMock from './mocks/electron';
import windowMock from './mocks/window';

mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
});

mockery.registerMock('electron', electronMock);
global.window = windowMock;