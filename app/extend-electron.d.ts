import type {Server} from './rpc';

declare module 'electron' {
  interface App {
    config: typeof import('./config');
    plugins: typeof import('./plugins');
    getWindows: () => Set<BrowserWindow>;
    getLastFocusedWindow: () => BrowserWindow | null;
    windowCallback?: (win: BrowserWindow) => void;
    createWindow: (fn?: (win: BrowserWindow) => void, options?: Record<string, any>) => BrowserWindow;
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
