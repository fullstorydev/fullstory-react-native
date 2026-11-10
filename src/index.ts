// When adding new imports, please verify that they are not causing the metro resolver to fail in earlier versions of react-native.
import { DeviceEventEmitter, HostComponent, NativeModules, Platform } from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';
import { ComponentRef } from 'react';
import type { FSSessionData } from './NativeFullStory';
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
  anonymize = () => null,
  identify = () => null,
  setUserVars = () => null,
  onReady: nativeOnReady = () =>
    Promise.resolve({ replayStartUrl: '', replayNowUrl: '', sessionId: '' }),
  getCurrentSession = () => Promise.resolve(''),
  getCurrentSessionURL = () => Promise.resolve(''),
  consent = () => null,
  event = () => null,
  shutdown = () => null,
  restart = () => null,
  log = () => null,
  resetIdleTimer = () => null,
} = FullStory ?? {};

function onReady(): Promise<FSSessionData>;
function onReady(listener: (data: FSSessionData) => void): { remove: () => void };
function onReady(
  listener?: (data: FSSessionData) => void,
): Promise<FSSessionData> | { remove: () => void } {
  if (!listener) {
    return nativeOnReady();
  }

  if (!isTurboModuleEnabled) {
    console.warn('FullStory: onReady with a listener is only supported on the New Architecture.');
    return { remove: () => null };
  }

  // Fire immediately if a session is already active
  getCurrentSessionURL().then((url: string) => {
    if (url) {
      getCurrentSession().then((sessionId: string) => {
        listener({ replayStartUrl: url, replayNowUrl: url, sessionId });
      });
    }
  });

  return DeviceEventEmitter.addListener('fsOnSessionStarted', listener);
}

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
type FSNativeInstance = ComponentRef<FSComponentType>;

interface NativeCommands {
  setBatchProperties: (viewRef: FSNativeInstance, props: object) => void;
}

/*
  Batching all property commands into a single native call to reduce the window for race conditions
  with React Native's rendering scheduler.
*/
const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['setBatchProperties'],
});

/**
 * Applies FullStory properties to an already-committed native instance by
 * dispatching a single batched native command. Invoked by the FullStory babel
 * plugin's Fabric commit-phase hook with the host component's public instance
 * and its committed props. iOS New Architecture only; on the old architecture
 * the regular view-manager prop pipeline applies these props instead.
 *
 * A prop with a valid value is sent as it is. A prop whose value is null is sent
 * as null, which tells native to clear it: the babel plugin sets a prop to null
 * when it was removed since the previous commit (e.g. fsClass 'fs-unmask' ->
 * undefined). Anything else is ignored. Types are validated because native casts
 * these values and a wrong type would crash it.
 */
export function applyFSPropertiesToInstance(
  instance: FSNativeInstance | null | undefined,
  props: Record<string, unknown> | null | undefined,
) {
  if (!instance || !props) {
    return;
  }
  if (!(isTurboModuleEnabled && Platform.OS === 'ios' && !Platform.isTV)) {
    return;
  }

  // Unrolled on purpose: this runs for every view the babel plugin queues, and looping over a key
  // list was measured at ~3x the cost.
  const batchedProps: Partial<Record<SupportedFSAttributes, string | object | null>> = {};
  let hasProps = false;

  const { fsClass, fsAttribute, fsTagName, dataElement, dataComponent, dataSourceFile } = props;

  if (fsClass === null || (fsClass && typeof fsClass === 'string')) {
    batchedProps.fsClass = fsClass;
    hasProps = true;
  }
  if (fsAttribute === null || (fsAttribute && typeof fsAttribute === 'object')) {
    batchedProps.fsAttribute = fsAttribute;
    hasProps = true;
  }
  if (fsTagName === null || (fsTagName && typeof fsTagName === 'string')) {
    batchedProps.fsTagName = fsTagName;
    hasProps = true;
  }
  if (dataElement === null || (dataElement && typeof dataElement === 'string')) {
    batchedProps.dataElement = dataElement;
    hasProps = true;
  }
  if (dataComponent === null || (dataComponent && typeof dataComponent === 'string')) {
    batchedProps.dataComponent = dataComponent;
    hasProps = true;
  }
  if (dataSourceFile === null || (dataSourceFile && typeof dataSourceFile === 'string')) {
    batchedProps.dataSourceFile = dataSourceFile;
    hasProps = true;
  }

  // Send all properties as a single batched command.
  if (hasProps) {
    Commands.setBatchProperties(instance, batchedProps);
  }
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
