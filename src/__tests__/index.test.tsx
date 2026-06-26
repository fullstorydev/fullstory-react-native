import { Platform } from 'react-native';
import { jest } from '@jest/globals';
import { applyFSPropertiesToInstance } from '../index';

declare global {
  var __turboModuleProxy: unknown;
}

jest.mock('react-native/Libraries/Utilities/codegenNativeCommands', () => {
  const commands = {
    setBatchProperties: jest.fn(),
  };
  return jest.fn(() => commands);
});

const codegenNativeCommands = require('react-native/Libraries/Utilities/codegenNativeCommands');
const mockNativeCommands = codegenNativeCommands();

jest.mock('../fullstoryInterface', () => {
  const actual =
    jest.requireActual<typeof import('../fullstoryInterface')>('../fullstoryInterface');
  return {
    ...actual,
    isTurboModuleEnabled: true,
  };
});

let originalPlatformOS: string;

const fsTagNameValue = 'custom-text-element';
const fsClassValue = 'custom-text-class';
const fsAttributeValue = { color: 'red' };

describe('FS properties on iOS New Architecture', () => {
  beforeAll(() => {
    originalPlatformOS = Platform.OS;
    global.__turboModuleProxy = jest.fn(() => ({}));
    Object.defineProperty(Platform, 'OS', {
      writable: true,
      value: 'ios',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.__turboModuleProxy = undefined;
    Object.defineProperty(Platform, 'OS', {
      writable: true,
      value: originalPlatformOS,
    });
  });

  describe('applyFSPropertiesToInstance', () => {
    const instance = {} as any;

    it('batches all fs* and data* properties into a single command', () => {
      applyFSPropertiesToInstance(instance, {
        fsTagName: fsTagNameValue,
        fsClass: fsClassValue,
        fsAttribute: fsAttributeValue,
        dataElement: 'Text',
        dataComponent: 'TestComponent',
        dataSourceFile: 'index.test.tsx',
      });

      expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledWith(instance, {
        fsTagName: fsTagNameValue,
        fsClass: fsClassValue,
        fsAttribute: fsAttributeValue,
        dataElement: 'Text',
        dataComponent: 'TestComponent',
        dataSourceFile: 'index.test.tsx',
      });
      expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledTimes(1);
    });

    it('only forwards recognized, correctly-typed properties', () => {
      applyFSPropertiesToInstance(instance, {
        fsClass: fsClassValue,
        fsTagName: 123,
        somethingElse: 'ignored',
      } as Record<string, unknown>);

      expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledWith(instance, {
        fsClass: fsClassValue,
      });
      expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledTimes(1);
    });

    it('does not dispatch when there are no FS properties', () => {
      applyFSPropertiesToInstance(instance, { somethingElse: 'ignored' });
      expect(mockNativeCommands.setBatchProperties).not.toHaveBeenCalled();
    });

    it('no-ops when the instance or props is missing', () => {
      applyFSPropertiesToInstance(null, { fsClass: fsClassValue });
      applyFSPropertiesToInstance(instance, null);
      applyFSPropertiesToInstance(instance, undefined);
      expect(mockNativeCommands.setBatchProperties).not.toHaveBeenCalled();
    });

    it('does not dispatch when not on iOS', () => {
      Object.defineProperty(Platform, 'OS', { writable: true, value: 'android' });
      applyFSPropertiesToInstance(instance, { fsClass: fsClassValue });
      Object.defineProperty(Platform, 'OS', { writable: true, value: 'ios' });
      expect(mockNativeCommands.setBatchProperties).not.toHaveBeenCalled();
    });
  });
});
