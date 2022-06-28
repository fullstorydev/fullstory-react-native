const { withPlugins, createRunOncePlugin } = require("@expo/config-plugins");

const withFullStoryAndroid = require("./withFullStoryAndroid");
const withFullStoryIos = require("./withFullStoryIos");
const { FULLSTORY_DEFAULT_VERSION } = require("./constants");

const pkg = require("../package.json");

const withFullStory = (config, pluginConfigs = {}) => {
  const { org, version } = pluginConfigs;

  if (!org) {
    throw new Error("Please specify an 'org' in your plugin arguments.");
  }

  if (!version) {
    pluginConfigs.version = FULLSTORY_DEFAULT_VERSION;
  }

  return withPlugins(config, [
    [withFullStoryIos, pluginConfigs],
    [withFullStoryAndroid, pluginConfigs],
  ]);
};

module.exports = createRunOncePlugin(withFullStory, pkg.name, pkg.version);
