import {
  ConfigPlugin,
  withPlugins,
  createRunOncePlugin,
} from "@expo/config-plugins";

import withFullStoryAndroid from "./withFullStoryAndroid";
import withFullStoryIos from "./withFullStoryIos";

const pkg = require("../../package.json");

type LogLevel = "off" | "error" | "warn" | "info" | "debug" | "log";

export type FullStoryAndroidProps = {
  logLevel?: LogLevel;
  logcatLevel?: LogLevel;
  enabledVariants?: string;
  addDependencies?: boolean;
};

type FullStoryIosProps = {
  // placeholder
};

export type FullStoryPluginProps = {
  org: string;
  version: string;
  host?: string;
  recordOnStart?: boolean;
} & FullStoryAndroidProps &
  FullStoryIosProps;

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
