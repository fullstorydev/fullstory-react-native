import { NativeModules } from 'react-native';
import { safeStringify } from './safeStringify';
import { isTurboModuleEnabled } from '../utils';

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
  [key in ConsoleLevels]?: MethodShim;
};

const logEvent = (level: LogLevel, args: ArrayLike<unknown>) => {
  const payload = [] as Array<string>;

  for (let i = 0; i < args.length; ++i) {
    payload.push(safeStringify(args[i], 1000));
  }

  FullStory.log(level, payload.join(' '));
};

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
    if (!this._isActive) {
      return;
    }

    this._isActive = false;
    let logLevel: ConsoleLevels;
    for (logLevel in this._shims) {
      if (!this._shims[logLevel]) {
        return;
      }

      // If possible, restore the original logger function
      const { override, native } = this._shims[logLevel] as MethodShim;
      // If our override has not been replaced by a 3rd party, revert back to native function
      if (console[logLevel] === override) {
        console[logLevel] = native as any;
        this._shims[logLevel] = undefined;
      }
    }
  }

  private _makeShim() {
    let rnLogLevel: ConsoleLevels;
    for (rnLogLevel in consoleLevelMap) {
      // copied by value for override func
      const _rnLogLevel = rnLogLevel;

      if (!(rnLogLevel in console)) {
        continue;
      }

      const originalLogger = console[rnLogLevel];

      const override = (...args: any[]) => {
        // call FS log with the mapped level
        if (this._isActive) {
          logEvent(consoleLevelMap[_rnLogLevel], args);
        }

        // call original logger
        originalLogger.apply(console, args);
      };

      console[rnLogLevel] = override;
      this._shims[rnLogLevel] = { override, native: originalLogger };
    }
  }
}

export default new ConsoleWatcher();
