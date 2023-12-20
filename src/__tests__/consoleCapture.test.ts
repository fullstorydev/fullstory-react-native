import { describe, it, expect, afterEach } from '@jest/globals';
import { NativeModules } from 'react-native';
import { enableConsoleCapture, LogLevel } from '../logging/consoleCapture';

describe('consoleCapture', () => {
  beforeAll(() => {
    enableConsoleCapture();
  });
  afterEach(() => {
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

  it('enableConsoleCapture should be idempotent', () => {
    enableConsoleCapture();
    enableConsoleCapture();

    const FSLog = NativeModules.FullStory.log;

    console.log('hello', 'goodbye', 'afternoon');
    expect(FSLog).toBeCalledTimes(1);
    expect(FSLog).toHaveBeenCalledWith(LogLevel.Log, '"hello" "goodbye" "afternoon"');
  });
});
