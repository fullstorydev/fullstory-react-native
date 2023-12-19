import { NativeModules } from 'react-native';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const FullStory = isTurboModuleEnabled
  ? require('./NativeFullStory').default
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

export const enableConsoleCapture = () => {
  type ConsoleLevels = keyof typeof consoleLevelMap;

  for (const rnLogLevel in consoleLevelMap) {
    if (!(rnLogLevel in console)) {
      continue;
    }

    const originalLogger = console[rnLogLevel as ConsoleLevels];

    console[rnLogLevel as ConsoleLevels] = function (message?: any, ...args: any[]) {
      // call FS log with the mapped level
      FullStory.log(consoleLevelMap[rnLogLevel as ConsoleLevels], [message, ...args].join(' '));

      // call original logger
      originalLogger.apply(console, [message, ...args]);
    };
  }
};
