module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  setupFiles: ['<rootDir>/setupTests.js'],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  transform: {
    '^.+\\.(js)$': 'babel-jest',
    '\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@react-native|react-native)/).*/'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/plugin'],
};
