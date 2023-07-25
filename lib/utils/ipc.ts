import {ipcRenderer as _ipc} from 'electron';

import type {IpcRendererWithCommands} from '../../typings/common';

export const ipcRenderer = _ipc as IpcRendererWithCommands;
