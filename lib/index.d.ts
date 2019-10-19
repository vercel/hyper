declare module 'php-escape-shell' {
  // eslint-disable-next-line @typescript-eslint/camelcase
  export function php_escapeshellcmd(path: string): string;
}

declare module 'parse-url' {
  export default function(...args: any[]): any;
}
