import {
  withPlugins,
  withProjectBuildGradle,
  withAppBuildGradle,
  AndroidConfig,
  ConfigPlugin,
} from "@expo/config-plugins";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";

import { FullStoryPluginProps } from ".";

const { withPermissions } = AndroidConfig.Permissions;

const withPermissionsDelegate: ConfigPlugin = (config) => {
  return withPermissions(config, [
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE",
  ]);
};

export const addFullStoryMavenRepo = (projectBuildGradle: string) => {
  return mergeContents({
    tag: `@fullstory/react-native repositories`,
    src: projectBuildGradle,
    newSrc: "maven { url 'https://maven.fullstory.com' }",
    anchor: /repositories/,
    offset: 1,
    comment: "//",
  }).contents;
};

export const addFullStoryProjectDependency = (
  projectBuildGradle: string,
  version: string
) => {
  return mergeContents({
    tag: `@fullstory/react-native dependencies`,
    src: projectBuildGradle,
    newSrc: `classpath 'com.fullstory:gradle-plugin-local:${version}'`,
    anchor: /dependencies/,
    offset: 1,
    comment: "//",
  }).contents;
};

const withProjectGradleDelegate: ConfigPlugin<FullStoryPluginProps> = (
  config,
  { version }
) => {
  return withProjectBuildGradle(config, ({ modResults, ...config }) => {
    if (modResults.language !== "groovy") {
      throw new Error(
        "Cannot configure FullStory in the project gradle because the file is not groovy."
      );
    }

    modResults.contents = addFullStoryProjectDependency(
      modResults.contents,
      version
    );
    modResults.contents = addFullStoryMavenRepo(modResults.contents);
    return { modResults, ...config };
  });
};

export const addFullStoryGradlePlugin = (
  appBuildGradle: string,
  { org, host, logLevel, enabledVariants }: FullStoryPluginProps
) => {
  return mergeContents({
    tag: `@fullstory/react-native plugin`,
    src: appBuildGradle,
    newSrc: `apply plugin: 'fullstory'
      fullstory {
          org '${org}'
          ${host ? `server 'https://${host}'` : ""}
          ${logLevel ? `logLevel '${logLevel}'` : ""}
          ${enabledVariants ? `enabledVariants '${enabledVariants}'` : ""}
      }`,
    anchor: /./,
    offset: 1,
    comment: "//",
  }).contents;
};

const withAppBuildGradleDelegate: ConfigPlugin<FullStoryPluginProps> = (
  config,
  pluginConfigs
) => {
  return withAppBuildGradle(config, ({ modResults, ...config }) => {
    if (modResults.language !== "groovy") {
      throw new Error(
        "Cannot configure FullStory in the app gradle because the file is not groovy."
      );
    }

    modResults.contents = addFullStoryGradlePlugin(
      modResults.contents,
      pluginConfigs
    );
    return { modResults, ...config };
  });
};

const withFullStoryAndroid: ConfigPlugin<FullStoryPluginProps> = (
  config,
  pluginConfigs
) => {
  return withPlugins(config, [
    [withProjectGradleDelegate, pluginConfigs],
    [withAppBuildGradleDelegate, pluginConfigs],
    withPermissionsDelegate,
  ]);
};

export default withFullStoryAndroid;
