import { NativeModules } from 'react-native';
import { safeStringify } from './safeStringify';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const FullStory = isTurboModuleEnabled
  ? require('../NativeFullStory').default
  : NativeModules.FullStory;

export enum LogLevel {
  Log = 0, // Clamps to Debug on iOS
  Debug = 1,
  Info = 2, // Default
  Warn = 3,
  Error = 4,
  Assert = 5, // Clamps to Error on Android
}

const consoleLevelMap = {
  log: LogLevel.Log,
  trace: LogLevel.Debug,
  debug: LogLevel.Debug,
  info: LogLevel.Info,
  warn: LogLevel.Warn,
  error: LogLevel.Error,
};

const logEvent = (level: LogLevel, args: ArrayLike<unknown>) => {
  const payload = [] as Array<string>;

  for (let i = 0; i < args.length; ++i) {
    payload.push(safeStringify(args[i], 1000));
  }

  FullStory.log(level, payload.join(' '));
};

export const enableConsoleCapture = (() => {
  let enabled = false;

  return () => {
    if (enabled) {
      return;
    }
    type ConsoleLevels = keyof typeof consoleLevelMap;

    for (const rnLogLevel in consoleLevelMap) {
      if (!(rnLogLevel in console)) {
        continue;
      }

      const originalLogger = console[rnLogLevel as ConsoleLevels];

      console[rnLogLevel as ConsoleLevels] = function (...args: any[]) {
        // call FS log with the mapped level
        logEvent(consoleLevelMap[rnLogLevel as ConsoleLevels], args);

        // call original logger
        originalLogger.apply(console, [...args]);
      };
    }

    enabled = true;
  };
})();
