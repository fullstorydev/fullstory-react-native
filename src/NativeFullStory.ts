import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

// needs to be defined here, cannot be imported
export type FSSessionData = {
  replayStartUrl: string;
  replayNowUrl: string;
  sessionId: string;
};

export interface Spec extends TurboModule {
  anonymize(): void;
  identify(uid: string, userVars?: Object): void;
  setUserVars(userVars: Object): void;
  onReady(): Promise<FSSessionData>;
  getCurrentSession(): Promise<string>;
  getCurrentSessionURL(): Promise<string>;
  consent(userConsents: boolean): void;
  event(eventName: string, eventProperties: Object): void;
  shutdown(): void;
  restart(): void;
  log(logLevel: number, message: string): void;
  resetIdleTimer(): void;
  startPage(nonce: string, pageName: string, pageProperties?: Object): void;
  endPage(uuid: string): void;
  updatePage(uuid: string, pageProperties: Object): void;
  readonly onFullstoryDidStartSession: EventEmitter<FSSessionData>;
}

export default TurboModuleRegistry.get<Spec>('FullStory');
