import type {Server} from './rpc';
import type {Vibrancy} from 'electron-acrylic-window';

declare module 'electron' {
  interface App {
    config: typeof import('./config');
    plugins: typeof import('./plugins');
    getWindows: () => Set<BrowserWindow>;
    getLastFocusedWindow: () => BrowserWindow | null;
    windowCallback?: (win: BrowserWindow) => void;
    createWindow: (
      fn?: (win: BrowserWindow) => void,
      options?: {size?: [number, number]; position?: [number, number]}
    ) => BrowserWindow;
    setVersion: (version: string) => void;
  }

  // type Server = import('./rpc').Server;
  interface BrowserWindow {
    uid: string;
    sessions: Map<any, any>;
    focusTime: number;
    clean: () => void;
    rpc: Server;
  }
}

declare module 'electron-acrylic-window' {
  interface BrowserWindow {
    setVibrancy(options?: Vibrancy | null): void;
  }
}
