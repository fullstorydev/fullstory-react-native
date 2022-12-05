import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";
import { OnReadyResponse } from ".";

type UserVars = {
  displayName?: string;
  email?: string;
  [key: string]: any;
};

export interface Spec extends TurboModule {
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
  log(logLevel: number, message: string): void;
  resetIdleTimer(): void;
}

export default TurboModuleRegistry.get<Spec>("FullStory");
