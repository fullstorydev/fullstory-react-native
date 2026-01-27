// When adding new imports, please verify that they are not causing the metro resolver to fail in earlier versions of react-native.
import { HostComponent, NativeModules, Platform } from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';
import { ComponentRef, ForwardedRef } from 'react';
import { FullstoryStatic, isTurboModuleEnabled, LogLevel } from './fullstoryInterface';

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
} = FullStory || {
  anonymize: () => null,
  identify: () => null,
  setUserVars: () => null,
  onReady: () => Promise.resolve({ isReady: false }),
  getCurrentSession: () => Promise.resolve(''),
  getCurrentSessionURL: () => Promise.resolve(''),
  consent: () => null,
  event: () => null,
  shutdown: () => null,
  restart: () => null,
  log: () => null,
  resetIdleTimer: () => null,
};

const FullStoryPrivate = isTurboModuleEnabled
  ? require('./NativeFullStoryPrivate').default
  : NativeModules.FullStoryPrivate;

declare type FullStoryPrivateStatic = {
  onFSPressForward?(
    tag: number,
    isLongPress: boolean,
    hasPressHandler: boolean,
    hasLongPressHandler: boolean,
  ): void;
};

const identifyWithProperties = (uid: string, userVars = {}) => identify(uid, userVars);

export { FSPage } from './FSPage';
type FSComponentType = HostComponent<NativeProps>;

interface NativeCommands {
  fsClass: (viewRef: ComponentRef<FSComponentType>, fsClass: string) => void;
  fsAttribute: (viewRef: ComponentRef<FSComponentType>, fsAttribute: object) => void;
  fsTagName: (viewRef: ComponentRef<FSComponentType>, fsTagName: string) => void;
  dataElement: (viewRef: ComponentRef<FSComponentType>, dataElement: string) => void;
  dataSourceFile: (viewRef: ComponentRef<FSComponentType>, dataElement: string) => void;
  dataComponent: (viewRef: ComponentRef<FSComponentType>, dataElement: string) => void;
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

let getInternalInstanceHandleFromPublicInstance: Function | undefined;

try {
  // This import confuses the metro resolver in earlier versions of react-native.
  getInternalInstanceHandleFromPublicInstance =
    require('react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactFabricPublicInstance').getInternalInstanceHandleFromPublicInstance;
} catch (e) {}

export const FS_REF_SYMBOL = Symbol('fullstory.ref');

type MaybeFSForwardedRef<T> = ForwardedRef<T> & {
  [FS_REF_SYMBOL]?: boolean;
};

type FSNativeElement = ComponentRef<FSComponentType> & {
  currentProps?: Record<string, unknown>;
};

// Shared wrapper for components without refs (most common case)
function sharedRefWrapper(element: FSNativeElement | null) {
  if (element && isTurboModuleEnabled && Platform.OS === 'ios' && !Platform.isTV) {
    let currentProps: Record<keyof NativeCommands, string | object>;

    if (getInternalInstanceHandleFromPublicInstance) {
      currentProps =
        getInternalInstanceHandleFromPublicInstance(element)?.stateNode?.canonical.currentProps;
    } else {
      // https://github.com/facebook/react-native/blob/87d2ea9c364c7ea393d11718c195dfe580c916ef/packages/react-native/Libraries/Components/TextInput/TextInputState.js#L109C23-L109C67
      // @ts-expect-error `currentProps` is missing in `NativeMethods`
      currentProps = element.currentProps;
    }
    if (currentProps) {
      const fsClass = currentProps.fsClass;
      if (fsClass && typeof fsClass === 'string') {
        Commands.fsClass(element, fsClass);
      }

      const fsAttribute = currentProps.fsAttribute;
      if (fsAttribute && typeof fsAttribute === 'object') {
        Commands.fsAttribute(element, fsAttribute);
      }

      const fsTagName = currentProps.fsTagName;
      if (fsTagName && typeof fsTagName === 'string') {
        Commands.fsTagName(element, fsTagName);
      }

      const dataElement = currentProps.dataElement;
      if (dataElement && typeof dataElement === 'string') {
        Commands.dataElement(element, dataElement);
      }

      const dataComponent = currentProps.dataComponent;
      if (dataComponent && typeof dataComponent === 'string') {
        Commands.dataComponent(element, dataComponent);
      }

      const dataSourceFile = currentProps.dataSourceFile;
      if (dataSourceFile && typeof dataSourceFile === 'string') {
        Commands.dataSourceFile(element, dataSourceFile);
      }
    }
  }
}

Object.defineProperty(sharedRefWrapper, FS_REF_SYMBOL, {
  value: true,
  enumerable: false,
  writable: false,
  configurable: false,
});

export function applyFSPropertiesWithRef(existingRef?: MaybeFSForwardedRef<FSNativeElement>) {
  // Return early if already wrapped
  if (existingRef && existingRef[FS_REF_SYMBOL]) {
    return existingRef;
  }

  // Use shared wrapper for null/undefined refs
  if (!existingRef) {
    return sharedRefWrapper;
  }

  function refWrapper(element: FSNativeElement | null) {
    sharedRefWrapper(element);

    if (existingRef) {
      if (typeof existingRef === 'function') {
        existingRef(element);
      } else {
        existingRef.current = element;
      }
    }
  }

  Object.defineProperty(refWrapper, FS_REF_SYMBOL, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return refWrapper;
}

const FullstoryAPI: FullstoryStatic = {
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

export const PrivateInterface: FullStoryPrivateStatic =
  Platform.OS === 'android' ? { onFSPressForward: FullStoryPrivate.onFSPressForward } : {};

export default FullstoryAPI;
