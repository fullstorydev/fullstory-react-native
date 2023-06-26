import { NativeModules } from 'react-native';

const isTurboModuleEnabled = global.__turboModuleProxy != null;

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
  createPage,
  startPage,
  endPage,
  updatePage,
} = FullStory;

const LogLevel = {
  Log: 0, // Clamps to Debug on iOS
  Debug: 1,
  Info: 2, // Default
  Warn: 3,
  Error: 4,
  Assert: 5, // Clamps to Error on Android
};

const createPageWithProperties = (pageName, pageProperties = {}) => createPage(pageName, pageProperties);
const startPageWithProperties = (pageProperties = {}) => startPage(pageProperties);
const identifyWithProperties = (uid, userVars = {}) => identify(uid, userVars);

export default {
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
  createPage: createPageWithProperties,
  startPage: startPageWithProperties,
  endPage,
  updatePage,
};
