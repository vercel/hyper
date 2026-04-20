export const pathContainsEntry = (pathParts: string[], targetPath: string) =>
  pathParts.some((pathPart) => pathPart.toLowerCase() === targetPath.toLowerCase());

export const pathStartsWithEntry = (pathPart: string, targetPath: string) =>
  pathPart.toLowerCase().startsWith(targetPath.toLowerCase());

export const refreshPathValueForHyperCLI = (currentPath: string, binPath: string, oldPath: string) => {
  const pathParts = currentPath
    .split(';')
    .filter(Boolean)
    .filter((pathPart) => !pathStartsWithEntry(pathPart, oldPath));

  if (!pathContainsEntry(pathParts, binPath)) {
    pathParts.push(binPath);
  }

  return pathParts.join(';');
};
