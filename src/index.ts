// When adding new imports, please verify that they are not causing the metro resolver to fail in earlier versions of react-native.
import { HostComponent, NativeModules, Platform } from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';
import { ComponentRef, ForwardedRef } from 'react';
import {
  FullstoryStatic,
  isTurboModuleEnabled,
  LogLevel,
  SupportedFSAttributes,
} from './fullstoryInterface';

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

if (!FullStory) {
  console.warn('FullStory: Native module not found. Falling back to stub implementations.');
}

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
  onReady: () => Promise.resolve({ replayStartUrl: '', replayNowUrl: '', sessionId: '' }),
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
  setBatchProperties: (viewRef: ComponentRef<FSComponentType>, props: object) => void;
}

/* 
  Batching all property commands into a single native call to reduce the window for race conditions
  with React Native's rendering scheduler.
*/
const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['setBatchProperties'],
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
    let currentProps: Record<string, unknown> | undefined;

    if (getInternalInstanceHandleFromPublicInstance) {
      currentProps =
        getInternalInstanceHandleFromPublicInstance(element)?.stateNode?.canonical.currentProps;
    } else {
      currentProps = element.currentProps;
    }
    if (currentProps) {
      const batchedProps: Partial<Record<SupportedFSAttributes, string | object>> = {};

      const fsClass = currentProps.fsClass;
      if (fsClass && typeof fsClass === 'string') {
        batchedProps.fsClass = fsClass;
      }

      const fsAttribute = currentProps.fsAttribute;
      if (fsAttribute && typeof fsAttribute === 'object') {
        batchedProps.fsAttribute = fsAttribute;
      }

      const fsTagName = currentProps.fsTagName;
      if (fsTagName && typeof fsTagName === 'string') {
        batchedProps.fsTagName = fsTagName;
      }

      const dataElement = currentProps.dataElement;
      if (dataElement && typeof dataElement === 'string') {
        batchedProps.dataElement = dataElement;
      }

      const dataComponent = currentProps.dataComponent;
      if (dataComponent && typeof dataComponent === 'string') {
        batchedProps.dataComponent = dataComponent;
      }

      const dataSourceFile = currentProps.dataSourceFile;
      if (dataSourceFile && typeof dataSourceFile === 'string') {
        batchedProps.dataSourceFile = dataSourceFile;
      }

      // Send all properties as a single batched command
      if (Object.keys(batchedProps).length > 0) {
        Commands.setBatchProperties(element, batchedProps);
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

export function applyFSPropertiesWithRef(
  existingRef?: MaybeFSForwardedRef<FSNativeElement>,
  hasDynamicAttributes = true,
) {
  // Return early if already wrapped
  if (existingRef && existingRef[FS_REF_SYMBOL]) {
    return existingRef;
  }

  if (!existingRef && !hasDynamicAttributes) {
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
