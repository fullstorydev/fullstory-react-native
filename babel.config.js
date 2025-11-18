module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@fullstory/babel-plugin-react-native',
    ['@fullstory/babel-plugin-annotate-react', { native: true }],
  ],
};
