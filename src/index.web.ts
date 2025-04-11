import { FullstoryStatic, LogLevel } from './fullstoryInterface';

const warningMessage = 'Fullstory React Native is not supported on web';

const noop = () => {
  console.warn(warningMessage);
};

const noopPromise = () => {
  return Promise.reject(new Error(warningMessage));
};

const FullstoryAPI: FullstoryStatic = {
  LogLevel,
  anonymize: noop,
  identify: noop,
  setUserVars: noop,
  onReady: noopPromise,
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
