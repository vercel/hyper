export const UPDATE_INSTALL = 'UPDATE_INSTALL';
export const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';

export interface UpdateInstallAction {
  type: typeof UPDATE_INSTALL;
}
export interface UpdateAvailableAction {
  type: typeof UPDATE_AVAILABLE;
  version: string;
  notes: string | null;
  releaseUrl: string;
  canInstall: boolean;
}

export type UpdateActions = UpdateInstallAction | UpdateAvailableAction;
