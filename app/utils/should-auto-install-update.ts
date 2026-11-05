export function shouldAutoInstallUpdate(
  updateReady: boolean,
  openWindowCount: number,
  platform: NodeJS.Platform
): boolean {
  return updateReady && openWindowCount === 0 && platform === 'darwin';
}
