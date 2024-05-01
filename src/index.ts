import { HostComponent, NativeModules, Platform } from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';
import { ForwardedRef } from 'react';
import consoleWatcher, { LogLevel } from './logging/consoleCapture';

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
  enableConsole(): void;
  disableConsole(): void;
};

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      fsAttribute?: { [key: string]: string };
      fsClass?: string;
      fsTagName?: string;
    }
  }
  const global: typeof globalThis & {
    __turboModuleProxy: unknown;
  };
}

const identifyWithProperties = (uid: string, userVars = {}) => identify(uid, userVars);

type FSComponentType = HostComponent<NativeProps>;

interface NativeCommands {
  fsClass: (viewRef: React.ElementRef<FSComponentType>, fsClass: string) => void;
  fsAttribute: (viewRef: React.ElementRef<FSComponentType>, fsAttribute: object) => void;
  fsTagName: (viewRef: React.ElementRef<FSComponentType>, fsTagName: string) => void;
  dataElement: (viewRef: React.ElementRef<FSComponentType>, dataElement: string) => void;
  dataSourceFile: (viewRef: React.ElementRef<FSComponentType>, dataElement: string) => void;
  dataComponent: (viewRef: React.ElementRef<FSComponentType>, dataElement: string) => void;
}

/* 
  Calling these commands sequentially will *not* lead to an intermediate state where views
  have incomplete attribute values. React's rendering phases protects against this race condition.
  See DOC-1863 for more information.
*/
const SUPPORTED_FS_ATTRIBUTES = [
  'fsClass',
  'fsAttribute',
  'fsTagName',
  'dataElement',
  'dataComponent',
  'dataSourceFile',
] as (keyof NativeCommands)[];

const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: SUPPORTED_FS_ATTRIBUTES,
});

export function applyFSPropertiesWithRef(existingRef?: ForwardedRef<unknown>) {
  return function (element: React.ElementRef<FSComponentType>) {
    // https://github.com/facebook/react-native/blob/87d2ea9c364c7ea393d11718c195dfe580c916ef/packages/react-native/Libraries/Components/TextInput/TextInputState.js#L109C23-L109C67
    // @ts-expect-error `currentProps` is missing in `NativeMethods`
    const currentProps = element?.currentProps as Record<keyof NativeCommands, string | object>;
    if (isTurboModuleEnabled && Platform.OS === 'ios' && currentProps) {
      const fsClass = currentProps.fsClass as string;
      if (fsClass) {
        Commands.fsClass(element, fsClass);
      }

      const fsAttribute = currentProps.fsAttribute as object;
      if (fsAttribute) {
        Commands.fsAttribute(element, fsAttribute);
      }

      const fsTagName = currentProps.fsTagName as string;
      if (fsTagName) {
        Commands.fsTagName(element, fsTagName);
      }

      const dataElement = currentProps.dataElement as string;
      if (dataElement) {
        Commands.dataElement(element, dataElement);
      }

      const dataComponent = currentProps.dataComponent as string;
      if (dataComponent) {
        Commands.dataComponent(element, dataComponent);
      }

      const dataSourceFile = currentProps.dataSourceFile as string;
      if (dataSourceFile) {
        Commands.dataSourceFile(element, dataSourceFile);
      }
    }

    if (existingRef) {
      if (existingRef instanceof Function) {
        existingRef(element);
      } else {
        existingRef.current = element;
      }
    }
  };
}

export { LogLevel };
export { FSPage } from './FSPage';

// default ON
consoleWatcher.enable();

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
  enableConsole: consoleWatcher.enable,
  disableConsole: consoleWatcher.disable,
};

export default FullStoryAPI;
