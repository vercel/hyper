declare module 'php-escape-shell' {
  export function php_escapeshellcmd(path: string): string;
}

declare module 'git-describe' {
  export function gitDescribe(...args: any[]): void;
}

declare module 'default-shell' {
  const val: string;
  export default val;
}

declare module 'sudo-prompt' {
  export function exec(
    cmd: string,
    options: {name?: string; icns?: string; env?: {[key: string]: string}},
    callback: (error?: Error, stdout?: string | Buffer, stderr?: string | Buffer) => void
  ): void;
}
