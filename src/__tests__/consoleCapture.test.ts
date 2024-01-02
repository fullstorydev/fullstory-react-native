import { describe, it, expect, afterEach } from '@jest/globals';
import { NativeModules } from 'react-native';
import consoleWatcher, { LogLevel } from '../logging/consoleCapture';

describe('consoleCapture', () => {
  const oldConsoleLog = console.log;
  const oldConsoleTrace = console.trace;
  const oldConsoleDebug = console.debug;
  const oldConsoleInfo = console.info;
  const oldConsoleWarn = console.warn;
  const oldConsoleError = console.error;

  beforeEach(() => {
    consoleWatcher.enable();
  });
  afterEach(() => {
    consoleWatcher.disable();
    // reset overwrite
    console.log = oldConsoleLog;
    jest.clearAllMocks();
  });

  it('Captures all log methods', () => {
    const FSLog = NativeModules.FullStory.log;

    console.log('goodlog0');
    console.trace('goodtrace0');
    console.debug('gooddebug0');
    console.info('goodinfo0');
    console.warn('goodwarn0');
    console.error('gooderror0');

    expect(FSLog).toBeCalledTimes(6);
    expect(FSLog).toHaveBeenCalledWith(LogLevel.Log, '"goodlog0"');
    expect(FSLog).toHaveBeenCalledWith(LogLevel.Debug, '"goodtrace0"');
    expect(FSLog).toHaveBeenCalledWith(LogLevel.Debug, '"gooddebug0"');
    expect(FSLog).toHaveBeenCalledWith(LogLevel.Info, '"goodinfo0"');
    expect(FSLog).toHaveBeenCalledWith(LogLevel.Warn, '"goodwarn0"');
    expect(FSLog).toHaveBeenCalledWith(LogLevel.Error, '"gooderror0"');
  });

  it('enableConsole and disableConsole should be idempotent', () => {
    consoleWatcher.enable();
    consoleWatcher.enable();

    const FSLog = NativeModules.FullStory.log;

    console.log('hello', 'goodbye', 'afternoon');
    expect(FSLog).toBeCalledTimes(1);
    expect(FSLog).toHaveBeenCalledWith(LogLevel.Log, '"hello" "goodbye" "afternoon"');

    consoleWatcher.disable();
    consoleWatcher.disable();

    console.log('hello', 'goodbye', 'afternoon');
    expect(FSLog).toBeCalledTimes(1);
  });

  it('disableConsole disables console capture', () => {
    consoleWatcher.disable();

    const FSLog = NativeModules.FullStory.log;

    console.log('hello');
    expect(FSLog).toBeCalledTimes(0);
  });

  it('disableConsole restores native console methods', () => {
    expect(oldConsoleLog).not.toEqual(console.log);
    expect(oldConsoleTrace).not.toEqual(console.trace);
    expect(oldConsoleDebug).not.toEqual(console.debug);
    expect(oldConsoleInfo).not.toEqual(console.info);
    expect(oldConsoleWarn).not.toEqual(console.warn);
    expect(oldConsoleError).not.toEqual(console.error);

    consoleWatcher.disable();

    expect(oldConsoleLog).toEqual(console.log);
    expect(oldConsoleTrace).toEqual(console.trace);
    expect(oldConsoleDebug).toEqual(console.debug);
    expect(oldConsoleInfo).toEqual(console.info);
    expect(oldConsoleWarn).toEqual(console.warn);
    expect(oldConsoleError).toEqual(console.error);
  });

  it('disableConsole does not overwrite third party overwrites', () => {
    let thirdPartyCall = 0;

    // A third party overwrites log
    const _oldConsole = console.log;
    const overwrite = (...args: any) => {
      thirdPartyCall++;
      return _oldConsole(...args);
    };
    console.log = overwrite;

    consoleWatcher.disable();
    console.log('hello');
    expect(overwrite).toEqual(console.log);
    expect(thirdPartyCall).toEqual(1);
  });

  it('Integrated testing', () => {
    let thirdPartyCall = 0;

    const FSLog = NativeModules.FullStory.log;

    console.log('goodlog0');
    expect(FSLog).toBeCalledTimes(1);

    consoleWatcher.disable();

    console.log('goodlog0');
    expect(FSLog).toBeCalledTimes(1);

    // A third party overwrites log
    const _oldConsole = console.log;
    const overwrite = (...args: any) => {
      thirdPartyCall++;
      return _oldConsole(...args);
    };
    console.log = overwrite;

    consoleWatcher.enable();

    console.log('goodlog0');

    expect(FSLog).toBeCalledTimes(2);
    expect(thirdPartyCall).toEqual(1);

    consoleWatcher.disable();

    console.log('goodlog0');

    // disable does not replace 3rd party overwrite function
    expect(overwrite).toEqual(console.log);
    expect(FSLog).toBeCalledTimes(2);
    expect(thirdPartyCall).toEqual(2);

    consoleWatcher.enable();

    console.log('goodlog0');

    // reenabling does still calls 3rd party overwrite function
    expect(FSLog).toBeCalledTimes(3);
    expect(thirdPartyCall).toEqual(3);
  });
});
