// When adding new imports, please verify that they are not causing the metro resolver to fail in earlier versions of react-native.
import { HostComponent, NativeModules, Platform } from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';
import { ForwardedRef } from 'react';
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
} = FullStory;

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

let getInternalInstanceHandleFromPublicInstance: Function | undefined;

try {
  // This import confuses the metro resolver in earlier versions of react-native.
  getInternalInstanceHandleFromPublicInstance =
    require('react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactFabricPublicInstance').getInternalInstanceHandleFromPublicInstance;
} catch (e) {}

const FS_REF_SYMBOL = Symbol('fullstory.ref');

type MaybeFSForwardedRef<T> = ForwardedRef<T> & {
  [FS_REF_SYMBOL]?: boolean;
};

export function applyFSPropertiesWithRef(existingRef?: MaybeFSForwardedRef<unknown>) {
  if (existingRef && existingRef[FS_REF_SYMBOL]) {
    return existingRef;
  }
  function refWrapper(element: React.ElementRef<FSComponentType>) {
    if (isTurboModuleEnabled && Platform.OS === 'ios') {
      let currentProps: Record<keyof NativeCommands, string | object>;

      if (getInternalInstanceHandleFromPublicInstance && element) {
        currentProps =
          getInternalInstanceHandleFromPublicInstance(element)?.stateNode?.canonical.currentProps;
      } else {
        // https://github.com/facebook/react-native/blob/87d2ea9c364c7ea393d11718c195dfe580c916ef/packages/react-native/Libraries/Components/TextInput/TextInputState.js#L109C23-L109C67
        // @ts-expect-error `currentProps` is missing in `NativeMethods`
        currentProps = element?.currentProps;
      }
      if (currentProps) {
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
    }

    if (existingRef) {
      if (existingRef instanceof Function) {
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
