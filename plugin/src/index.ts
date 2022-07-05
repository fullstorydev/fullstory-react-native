import {
  ConfigPlugin,
  withPlugins,
  createRunOncePlugin,
} from "@expo/config-plugins";

import { FULLSTORY_DEFAULT_VERSION } from "./constants";
import withFullStoryAndroid from "./withFullStoryAndroid";
import withFullStoryIos from "./withFullStoryIos";

const pkg = require("../../package.json");

export type FullStoryPluginProps = {
  org: string;
  version: string;
  host?: string;
  logLevel?: string;
  enabledVariants?: string;
};

const withFullStory: ConfigPlugin<FullStoryPluginProps> = (
  config,
  pluginConfigs
) => {
  if (!pluginConfigs.org) {
    throw new Error("Please specify an 'org' in your plugin arguments.");
  }

  if (!pluginConfigs.version) {
    throw new Error("Please specify a 'version' in your plugin arguments.");
  }

  return withPlugins(config, [
    [withFullStoryIos, pluginConfigs],
    [withFullStoryAndroid, pluginConfigs],
  ]);
};

module.exports = createRunOncePlugin(withFullStory, pkg.name, pkg.version);
