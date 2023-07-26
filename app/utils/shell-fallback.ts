export const getFallBackShellConfig = (
  shell: string,
  shellArgs: string[],
  defaultShell: string,
  defaultShellArgs: string[]
): {
  shell: string;
  shellArgs: string[];
} | null => {
  if (shellArgs.length > 0) {
    return {
      shell,
      shellArgs: []
    };
  }

  if (shell != defaultShell) {
    return {
      shell: defaultShell,
      shellArgs: defaultShellArgs
    };
  }

  return null;
};
