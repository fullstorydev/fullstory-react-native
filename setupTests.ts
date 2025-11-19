import { NativeModules } from 'react-native';
import { jest } from '@jest/globals';

// Mock getInternalInstanceHandleFromPublicInstance since the testing library doesn't provide it
jest.mock(
  'react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactFabricPublicInstance',
  () => {
    const originalModule: any = jest.requireActual(
      'react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactFabricPublicInstance',
    );

    return {
      ...originalModule,
      getInternalInstanceHandleFromPublicInstance: jest.fn((element: any) => {
        // Return a mock structure that includes currentProps from the element
        if (element && element._reactInternals && element._reactInternals.memoizedProps) {
          return {
            stateNode: {
              canonical: {
                currentProps: element._reactInternals.memoizedProps,
              },
            },
          };
        }
        return null;
      }),
    };
  },
);

NativeModules.FullStory = {
  startPage: jest.fn(),
  endPage: jest.fn(),
  updatePage: jest.fn(),
};
