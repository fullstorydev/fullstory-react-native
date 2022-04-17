import {NativeModules} from 'react-native';

declare const {FullStory} = NativeModules;

export type OnReadyResponse = {
  replayStartUrl: string;
  replayNowUrl: string;
  sessionId: string;
};

export const LogLevel = {
  Log: 0, // Clamps to Debug on iOS
  Debug: 1,
  Info: 2, // Default
  Warn: 3,
  Error: 4,
  Assert: 5, // Clamps to Error on Android
};

interface FullStoryInterface {
  LogLevel: typeof LogLevel;
  anonymize(): void;
  identify(string, Object): void;
  setUserVars(Object): void;
  onReady(): Promise<OnReadyResponse>;
  getCurrentSession(): Promise<string>;
  getCurrentSessionURL(): Promise<string>;
  consent(boolean): void;
  event(string, Object);
  shutdown(): void;
  restart(): void;
  log(number, string): void;
}

export default FullStory as FullStoryInterface;
