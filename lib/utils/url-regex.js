export const sh = /(?:ba)?sh: ((?:file:\/\/)|(?:\/\/))?(.*): (?:(?:command not found)|(?:No such file or directory))/;
export const bash = sh;
export const zsh = /zsh: (?:(?:command not found)|(?:no such file or directory)): ((?:file:\/\/)|(?:\/\/))?([^\n]+)/;
export const fish = /fish: Unknown command '((?:file:\/\/)|(?:\/\/))?([^']+)'/;

export const isValidUrl = url => {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
        
    return pattern.test(url);
}
