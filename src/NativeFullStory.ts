import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import { OnReadyResponse } from '.';

export interface Spec extends TurboModule {
  anonymize(): void;
  identify(uid: string, userVars?: Object): void;
  setUserVars(userVars: Object): void;
  onReady(): Promise<OnReadyResponse>;
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
  updatePage(pageProperties: Object): void;
}

export default TurboModuleRegistry.get<Spec>('FullStory');
