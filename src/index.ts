import { Platform } from 'react-native';
import { LogLevel } from './logging';
import { FullStory, FullStoryPrivate } from './core';

const {
  anonymize,
  identify,
  setUserVars,
  onReady,
  getCurrentSession,
  getCurrentSessionURL,
  consent,
  event,
  shutdown,
  restart,
  log,
  resetIdleTimer,
} = FullStory;

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

declare type FullStoryPrivateStatic = {
  onFSPressForward?(
    tag: number,
    isLongPress: boolean,
    hasPressHandler: boolean,
    hasLongPressHandler: boolean,
  ): void;
};

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      fsAttribute?: { [key: string]: string };
      fsClass?: string;
      fsTagName?: string;
    }
  }
  let __turboModuleProxy: boolean;
}

export { FSPage } from './FSPage';

const FullStoryAPI: FullStoryStatic = {
  anonymize,
  identify: (uid: string, userVars = {}) => identify(uid, userVars),
  setUserVars,
  onReady,
  getCurrentSession,
  getCurrentSessionURL,
  consent,
  event,
  shutdown,
  restart,
  log,
  resetIdleTimer,
  LogLevel,
};

export const PrivateInterface: FullStoryPrivateStatic =
  Platform.OS === 'android' ? { onFSPressForward: FullStoryPrivate.onFSPressForward } : {};

export { LogLevel } from './logging';
export { applyFSPropertiesWithRef } from './core';
export default FullStoryAPI;
