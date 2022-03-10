import {NativeModules} from 'react-native';

declare const {FullStory} = NativeModules;

type OnReadyResponse = {
  replayStartUrl: string;
  replayNowUrl: string;
  sessionId: string;
};

interface FullStoryInterface {
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
