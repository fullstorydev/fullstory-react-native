module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:import/typescript', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', '@react-native/eslint-plugin-specs', 'jest'],
};
