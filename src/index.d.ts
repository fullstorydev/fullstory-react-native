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

interface UserVars {
  displayName?: string;
  email?: string;
  [key: string]: any;
}

declare type FullStoryStatic = {
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

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      fsAttribute?: { [key: string]: string };
      fsClass?: string;
      fsTagName?: string;
    }
  }
}

export declare class FSPage {
  private pageName;
  private nonce;
  private properties;
  constructor(pageName: string, properties?: Object);
  private static FS_PAGE_NAME_KEY;
  private static isObject;
  private static merge;
  private static mergeObjects;
  private cleanProperties;
  update(properties: Object): void;
  start(properties?: Object): void;
  end(): void;
}

declare const FullStory: FullStoryStatic;
export default FullStory;
