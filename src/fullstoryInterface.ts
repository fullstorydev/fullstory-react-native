import { FSSessionData, Spec } from './NativeFullStory';

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

type SharedMethods = Pick<
  Spec,
  | 'anonymize'
  | 'identify'
  | 'onReady'
  | 'getCurrentSession'
  | 'getCurrentSessionURL'
  | 'consent'
  | 'event'
  | 'shutdown'
  | 'restart'
  | 'resetIdleTimer'
>;

export declare type FullstoryStatic = SharedMethods & {
  LogLevel: typeof LogLevel;
  setUserVars(userVars: UserVars): void;
  log(logLevel: LogLevel, message: string): void;
  readonly onFullstoryDidStartSession: (
    listener: (data: FSSessionData) => void,
  ) => { remove: () => void } | null;
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
