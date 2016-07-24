export const sh = /(?:ba)?sh: ((?:https?:\/\/)|(?:file:\/\/)|(?:\/\/))?(.*): (?:(?:command not found)|(?:No such file or directory))/;
export const bash = sh;
export const zsh = /zsh: (?:(?:command not found)|(?:no such file or directory)): ((?:https?:\/\/)|(?:file:\/\/)|(?:\/\/))?([^\n]+)/;
export const fish = /fish: Unknown command '((?:https?:\/\/)|(?:file:\/\/)|(?:\/\/))?([^']+)'/;
