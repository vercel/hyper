import {FontWeight} from 'xterm';

export type ColorMap = {
  black: string;
  blue: string;
  cyan: string;
  green: string;
  lightBlack: string;
  lightBlue: string;
  lightCyan: string;
  lightGreen: string;
  lightMagenta: string;
  lightRed: string;
  lightWhite: string;
  lightYellow: string;
  magenta: string;
  red: string;
  white: string;
  yellow: string;
};

export type configOptions = {
  autoUpdatePlugins: boolean | string;
  backgroundColor: string;
  bell: string;
  bellSound: string | null;
  bellSoundURL: string | null;
  borderColor: string;
  colors: ColorMap;
  copyOnSelect: boolean;
  css: string;
  cursorAccentColor: string;
  cursorBlink: boolean;
  cursorColor: string;
  cursorShape: 'BEAM' | 'UNDERLINE' | 'BLOCK';
  defaultSSHApp: boolean;
  disableLigatures: boolean;
  env: Record<string, string>;
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontWeightBold: FontWeight;
  foregroundColor: string;
  letterSpacing: number;
  lineHeight: number;
  macOptionSelectionMode: string;
  modifierKeys: {
    altIsMeta: boolean;
    cmdIsMeta: boolean;
  };
  padding: string;
  quickEdit: boolean;
  scrollback: number;
  selectionColor: string;
  shell: string;
  shellArgs: string[];
  showHamburgerMenu: boolean | '';
  showWindowControls: string;
  termCSS: string;
  uiFontFamily: string;
  updateChannel: 'stable' | 'canary';
  useConpty: boolean;
  webGLRenderer: boolean;
  webLinksActivationKey: 'ctrl' | 'alt' | 'meta' | 'shift';
  windowSize: [number, number];
};

export type rawConfig = {
  config?: configOptions;
  plugins?: string[];
  localPlugins?: string[];
  keymaps?: Record<string, string | string[]>;
};

export type parsedConfig = {
  config: configOptions;
  plugins: string[];
  localPlugins: string[];
  keymaps: Record<string, string[]>;
};
