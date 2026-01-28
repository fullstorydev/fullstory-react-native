declare const global: {
  RN$Bridgeless?: boolean;
  __turboModuleProxy?: unknown;
};

export const isTurboModuleEnabled = global.RN$Bridgeless || global.__turboModuleProxy != null;

interface UserVars {
  displayName?: string;
  email?: string;
  [key: string]: any;
}
export type OnReadyResponse = {
  replayStartUrl: string;
  replayNowUrl: string;
  sessionId: string;
};

export enum LogLevel {
  Log = 0, // Clamps to Debug on iOS
  Debug = 1,
  Info = 2, // Default
  Warn = 3,
  Error = 4,
  Assert = 5, // Clamps to Error on Android
}

export type SupportedFSAttributes =
  | 'fsClass'
  | 'fsAttribute'
  | 'fsTagName'
  | 'dataElement'
  | 'dataComponent'
  | 'dataSourceFile';

export declare type FullstoryStatic = {
  LogLevel: typeof LogLevel;
  anonymize(): void;
  identify(uid: string, userVars?: UserVars): void;
  setUserVars(userVars: UserVars): void;
  onReady(): Promise<OnReadyResponse>;
  getCurrentSession(): Promise<string>;
  getCurrentSessionURL(): Promise<string>;
  consent(userConsents: boolean): void;
  event(eventName: string, eventProperties: Object): void;
  shutdown(): void;
  restart(): void;
  log(logLevel: LogLevel, message: string): void;
  resetIdleTimer(): void;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicAttributes {
      fsAttribute?: { [key: string]: string };
      fsClass?: string;
      fsTagName?: string;
    }
  }
}
