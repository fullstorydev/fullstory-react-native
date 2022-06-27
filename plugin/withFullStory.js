const { withPlugins, createRunOncePlugin } = require("@expo/config-plugins");

const withFullStoryAndroid = require("./withFullStoryAndroid");
const withFullStoryIos = require("./withFullStoryIos");

const pkg = require("../package.json");

module.exports = createRunOncePlugin(
  (config) => withPlugins(config, [[withFullStoryIos], [withFullStoryAndroid]]),
  pkg.name,
  pkg.version
);
