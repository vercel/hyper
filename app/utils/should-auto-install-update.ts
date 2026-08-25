export function shouldAutoInstallUpdate(updateReady: boolean, openWindowCount: number, canInstall: boolean): boolean {
  return updateReady && canInstall && openWindowCount === 0;
}
