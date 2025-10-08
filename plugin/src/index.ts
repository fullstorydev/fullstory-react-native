import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import withFullStoryAndroid from './withFullStoryAndroid';
import withFullStoryIos from './withFullStoryIos';

const pkg = require('../../package.json');

type LogLevel = 'off' | 'error' | 'warn' | 'info' | 'debug' | 'log';

type FullStoryCrossPlatformProps = {
  org: string;
  version: string;
  host?: string;
  recordOnStart?: boolean;
  additionalConfigs?: {
    ios?: { [configuration: string]: any };
    android?: { [configuration: string]: any };
  };
};

export type FullStoryAndroidProps = {
  logLevel?: LogLevel;
  logcatLevel?: LogLevel;
  enabledVariants?: string;
} & FullStoryCrossPlatformProps;

export type FullStoryIosProps = {
  includeAssets?: { [directory: string]: string[] };
  workaroundRNSVGCapture?: boolean;
  workaroundWKUserContentControllerRemoveAllUserScripts?: boolean;
  infoPlistPath?: string;
} & FullStoryCrossPlatformProps;

type FullStoryPluginProps = FullStoryAndroidProps & FullStoryIosProps;

const withFullStory: ConfigPlugin<FullStoryPluginProps> = (config, pluginConfigs) => {
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

export default createRunOncePlugin(withFullStory, pkg.name, pkg.version);
