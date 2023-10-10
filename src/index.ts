import { HostComponent, NativeModules } from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';
import { MutableRefObject } from 'react';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

interface NativeProps extends ViewProps {
  fsClass?: string;
  fsAttribute?: object;
  fsTagName?: string;
  dataElement?: string;
  dataSourceFile?: string;
  dataComponent?: string;
}

const FullStory = isTurboModuleEnabled
  ? require('./NativeFullStory').default
  : NativeModules.FullStory;

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

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      fsAttribute?: { [key: string]: string };
      fsClass?: string;
      fsTagName?: string;
    }
  }
}

const identifyWithProperties = (uid: string, userVars = {}) => identify(uid, userVars);

export { FSPage } from './FSPage';
type FSComponentType = HostComponent<NativeProps>;

interface NativeCommands {
  fsClass: (viewRef: React.ElementRef<FSComponentType>, fsClass: string) => void;
  fsAttribute: (viewRef: React.ElementRef<FSComponentType>, fsAttribute: object) => void;
  fsTagName: (viewRef: React.ElementRef<FSComponentType>, fsTagName: string) => void;
  dataElement: (viewRef: React.ElementRef<FSComponentType>, dataElement: string) => void;
  dataSourceFile: (viewRef: React.ElementRef<FSComponentType>, dataElement: string) => void;
  dataComponent: (viewRef: React.ElementRef<FSComponentType>, dataElement: string) => void;
}

const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'fsClass',
    'fsAttribute',
    'fsTagName',
    'dataElement',
    'dataComponent',
    'dataSourceFile',
  ],
});

export function applyFSPropertiesWithRef(existingRef?: MutableRefObject<unknown>) {
  return function (element: React.ElementRef<FSComponentType>) {
    // https://github.com/facebook/react-native/blob/87d2ea9c364c7ea393d11718c195dfe580c916ef/packages/react-native/Libraries/Components/TextInput/TextInputState.js#L109C23-L109C67
    // @ts-expect-error `currentProps` is missing in `NativeMethods`
    if (element && element.currentProps) {
      // @ts-expect-error `currentProps` is missing in `NativeMethods`
      const fsClass = element.currentProps['fsClass'];
      if (fsClass) {
        // console.log('fsClass=' + fsClass);
        Commands.fsClass(element, fsClass);
      }
      // @ts-expect-error `currentProps` is missing in `NativeMethods`
      const fsAttribute = element.currentProps['fsAttribute'];
      if (fsAttribute) {
        // console.log('fsAttribute=' + fsAttribute);
        Commands.fsAttribute(element, fsAttribute);
      }
      // @ts-expect-error `currentProps` is missing in `NativeMethods`
      const fsTagName = element.currentProps['fsTagName'];
      if (fsTagName) {
        Commands.fsTagName(element, fsTagName);
      }
      // @ts-expect-error `currentProps` is missing in `NativeMethods`
      const dataElement = element.currentProps['dataElement'];
      if (dataElement) {
        Commands.dataElement(element, dataElement);
      }
      // @ts-expect-error `currentProps` is missing in `NativeMethods`
      const dataComponent = element.currentProps['dataComponent'];
      if (dataComponent) {
        Commands.dataComponent(element, dataComponent);
      }
      // @ts-expect-error `currentProps` is missing in `NativeMethods`
      const dataSourceFile = element.currentProps['dataSourceFile'];
      if (dataSourceFile) {
        Commands.dataSourceFile(element, dataSourceFile);
      }

      if (existingRef) {
        if (existingRef instanceof Function) {
          existingRef(element);
        } else {
          existingRef.current = element;
        }
      }
    }
  };
}

const FullStoryAPI: FullStoryStatic = {
  anonymize,
  identify: identifyWithProperties,
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

export default FullStoryAPI;
