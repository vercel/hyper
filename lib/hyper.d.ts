declare global {
  interface Window {
    __rpcId: string;
  }
}

export type ITermGroup = {
  uid: string | null;
  sessionUid: string | null;
  parentUid: string | null;
  direction: string | null;
  sizes: number[] | null;
  children: string[];
};

export type ITermGroups = Record<string, ITermGroup>;

export type ITermState = {
  termGroups: ITermGroups;
  activeSessions: Record<string, string>;
  activeRootGroup: string | null;
};
