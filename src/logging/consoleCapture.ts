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
type ConsoleLevels = keyof typeof consoleLevelMap;

type MethodShim = Record<'native' | 'override', Function>;

type ConsoleShims = {
  [K in keyof typeof consoleLevelMap]?: MethodShim | null;
};

const logEvent = (level: LogLevel, args: ArrayLike<unknown>) => {
  const payload = [] as Array<string>;

  for (let i = 0; i < args.length; ++i) {
    payload.push(safeStringify(args[i], 1000));
  }

  FullStory.log(level, payload.join(' '));
};

// A naive version of ConsoleWatcher on web.
// See https://github.com/cowpaths/mn/blob/865353f374b687e481d3b230e7eec8e1d7be2eb4/projects/fullstory/packages/recording/src/consolewatcher.ts
class ConsoleWatcher {
  private _isActive = false;
  private _shims: ConsoleShims = {};

  enable() {
    if (this._isActive) {
      return;
    }

    this._makeShim();
    this._isActive = true;
  }

  disable() {
    if (this._isActive) {
      this._isActive = false;
      for (const logLevel in this._shims as ConsoleShims) {
        if (!this._shims[logLevel as ConsoleLevels]) {
          return;
        }

        // If possible, restore the original logger function
        const { override, native } = this._shims[logLevel as ConsoleLevels] as MethodShim;
        // If our override has not been replaced by a 3rd party, revert back to native function
        if (console[logLevel as ConsoleLevels] === override) {
          console[logLevel as ConsoleLevels] = native as any;
          this._shims[logLevel as ConsoleLevels] = undefined;
        }
      }
    }
  }

  private _makeShim() {
    for (const rnLogLevel in consoleLevelMap) {
      if (!(rnLogLevel in console)) {
        continue;
      }

      const originalLogger = console[rnLogLevel as ConsoleLevels];

      const override = (...args: any[]) => {
        // call FS log with the mapped level
        if (this._isActive) {
          logEvent(consoleLevelMap[rnLogLevel as ConsoleLevels], args);
        }

        // call original logger
        originalLogger.apply(console, [...args]);
      };

      console[rnLogLevel as ConsoleLevels] = override;
      this._shims[rnLogLevel as ConsoleLevels] = { override, native: originalLogger };
    }
  }
}

export default new ConsoleWatcher();
