import { NativeModules } from 'react-native';
import { safeStringify } from '@fullstory/safe-stringify';
import { LogLevel } from './logging';

const isTurboModuleEnabled = __turboModuleProxy != null;

const FullStory = isTurboModuleEnabled
  ? require('./NativeFullStory').default
  : NativeModules.FullStory;

const parseJSStackTrace = (error: Error) => {
  if (!error || !error.stack) {
    return [];
  }
  const parseErrorStack = require('react-native/Libraries/Core/Devtools/parseErrorStack');
  return parseErrorStack(error.stack);
};

function setupReactNativeErrorHandler() {
  const defaultHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    const stack = parseJSStackTrace(error);
    const errorMessage = `${error.name}: ${error.message} ${safeStringify(stack)}`;

    FullStory.log(LogLevel.Error, errorMessage);

    if (defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });
}

export default setupReactNativeErrorHandler;
