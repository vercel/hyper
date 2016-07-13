export const domain = /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/;
export const bash = /(ba)?sh: ((https?:\/\/)|(\/\/))?(.*): ((command not found)|(No such file or directory))/;
export const zsh = /zsh: ((command not found)|(no such file or directory)): ((https?:\/\/)|(\/\/))?([^\n]+)/;
export const fish = /fish: Unknown command '((https?:\/\/)|(\/\/))?([^']+)'/;
