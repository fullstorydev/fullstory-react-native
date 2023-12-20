import { NativeModules } from 'react-native';
import { jest } from '@jest/globals';

NativeModules.FullStory = {
  startPage: jest.fn(),
  endPage: jest.fn(),
  updatePage: jest.fn(),
  log: jest.fn(),
};
