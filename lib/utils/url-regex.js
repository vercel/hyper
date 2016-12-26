export const sh = /(?:ba)?sh: ((?:file:\/\/)|(?:\/\/))?(.*): (?:(?:command not found)|(?:No such file or directory))/;
export const bash = sh;
export const zsh = /zsh: (?:(?:command not found)|(?:no such file or directory)): ((?:file:\/\/)|(?:\/\/))?([^\n]+)/;
export const fish = /fish: Unknown command '((?:file:\/\/)|(?:\/\/))?([^']+)'/;
