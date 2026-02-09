import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Text, Platform, View } from 'react-native';
import { jest } from '@jest/globals';
import { applyFSPropertiesWithRef } from '../index';

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

describe('Reading FS properties on iOS', () => {
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

  it('Reads fs properties correctly', () => {
    const TestComponent = () => {
      return (
        <Text fsTagName={fsTagNameValue} fsClass={fsClassValue} fsAttribute={fsAttributeValue}>
          Test Title
        </Text>
      );
    };

    render(<TestComponent />);

    // All properties should be batched into a single setBatchProperties call
    expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        fsTagName: fsTagNameValue,
        fsClass: fsClassValue,
        fsAttribute: fsAttributeValue,
      }),
    );
    expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledTimes(1);
  });

  it('Annotate plugin annotates correctly', () => {
    const TestComponent = () => {
      return <Text>Test Title</Text>;
    };
    render(<TestComponent />);

    // All properties should be batched into a single setBatchProperties call
    expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        dataElement: 'Text',
        dataComponent: 'TestComponent',
        dataSourceFile: 'index.test.tsx',
      }),
    );
    expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledTimes(1);
  });

  it('Handles existing ref objects correctly', () => {
    const ref = React.createRef<View>();
    render(<View ref={ref} fsTagName={fsTagNameValue} />);
    expect(ref.current).toBeDefined();
    expect((ref.current as any)?._reactInternals?.type).toBe(View);
    expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        fsTagName: fsTagNameValue,
      }),
    );
    expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledTimes(1);
  });

  it('Handles existing ref functions correctly', () => {
    const ref = jest.fn<(element: View) => void>();
    render(<View ref={ref} fsTagName={fsTagNameValue} />);
    expect(ref).toHaveBeenCalledWith(expect.any(Object));
    expect((ref.mock.calls[0][0] as any)?._reactInternals?.type).toBe(View);
    expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        fsTagName: fsTagNameValue,
      }),
    );
    expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledTimes(1);
  });

  it('Calls Native Command once even if double wrapped', () => {
    render(<View ref={applyFSPropertiesWithRef()} fsTagName={fsTagNameValue} />);
    expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        fsTagName: fsTagNameValue,
      }),
    );
    expect(mockNativeCommands.setBatchProperties).toHaveBeenCalledTimes(1);
  });
});
