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

const withProjectGradleDelegate: ConfigPlugin<FullStoryPluginProps> = (
  config,
  { version }
) => {
  const addFullStoryMavenRepo = (projectBuildGradle: string) => {
    return mergeContents({
      tag: `@fullstory/react-native repositories`,
      src: projectBuildGradle,
      newSrc: "maven { url 'https://maven.fullstory.com' }",
      anchor: /repositories/,
      offset: 1,
      comment: "//",
    }).contents;
  };

  const addFullStoryProjectDependency = (projectBuildGradle: string) => {
    return mergeContents({
      tag: `@fullstory/react-native dependencies`,
      src: projectBuildGradle,
      newSrc: `classpath 'com.fullstory:gradle-plugin-local:${version}'`,
      anchor: /dependencies/,
      offset: 1,
      comment: "//",
    }).contents;
  };

  return withProjectBuildGradle(config, ({ modResults, ...config }) => {
    if (modResults.language !== "groovy") {
      throw new Error(
        "Cannot configure FullStory in the project gradle because the file is not groovy."
      );
    }

    modResults.contents = addFullStoryProjectDependency(modResults.contents);
    modResults.contents = addFullStoryMavenRepo(modResults.contents);
    return { modResults, ...config };
  });
};

const withAppBuildGradleDelegate: ConfigPlugin<FullStoryPluginProps> = (
  config,
  { org, host, logLevel, enabledVariants }
) => {
  const addFullStoryGradlePlugin = (appBuildGradle: string) => {
    return mergeContents({
      tag: `@fullstory/react-native plugin`,
      src: appBuildGradle,
      newSrc: `apply plugin: 'fullstory'
        fullstory {
            org '${org}'
            server ${host ? `'https://${host}'` : ""}
            logLevel '${logLevel || ""}'
            enabledVariants '${enabledVariants || ""}'
        }`,
      anchor: /./,
      offset: 1,
      comment: "//",
    }).contents;
  };

  return withAppBuildGradle(config, ({ modResults, ...config }) => {
    if (modResults.language !== "groovy") {
      throw new Error(
        "Cannot configure FullStory in the app gradle because the file is not groovy."
      );
    }

    modResults.contents = addFullStoryGradlePlugin(modResults.contents);
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
