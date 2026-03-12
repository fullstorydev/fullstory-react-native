import { FullstoryStatic, LogLevel } from './fullstoryInterface';
import type { FSSessionData } from './NativeFullStory';

const warningMessage = 'Fullstory React Native is not supported on web';

const noop = () => {
  console.warn(warningMessage);
};

const noopPromise = () => {
  return Promise.reject(new Error(warningMessage));
};

function onReady(): Promise<FSSessionData>;
function onReady(listener: (data: FSSessionData) => void): { remove: () => void };
function onReady(
  listener?: (data: FSSessionData) => void,
): Promise<FSSessionData> | { remove: () => void } {
  if (!listener) {
    return noopPromise();
  }
  console.warn(warningMessage);
  return { remove: noop };
}

const FullstoryAPI: FullstoryStatic = {
  LogLevel,
  anonymize: noop,
  identify: noop,
  setUserVars: noop,
  onReady,
  getCurrentSession: noopPromise,
  getCurrentSessionURL: noopPromise,
  consent: noop,
  event: noop,
  shutdown: noop,
  restart: noop,
  log: noop,
  resetIdleTimer: noop,
};

export default FullstoryAPI;
