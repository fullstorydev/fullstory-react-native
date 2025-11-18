module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  setupFiles: ['<rootDir>/setupTests.ts'],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  transform: { '^.+\\.(js)$': 'babel-jest' },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@react-native|react-native|react)/).*/'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/plugin', '<rootDir>/lib'],
  moduleNameMapper: {
    '^@fullstory/react-native$': '<rootDir>/src/index.ts',
  },
};
