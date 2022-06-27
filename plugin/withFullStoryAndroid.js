const {
  withPlugins,
  withProjectBuildGradle,
  withAppBuildGradle,
  AndroidConfig,
} = require("@expo/config-plugins");

const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");

const { withPermissions } = AndroidConfig.Permissions;

const withPermissionsDelegate = (config) => {
  return withPermissions(config, [
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE",
  ]);
};

const withProjectGradleDelegate = (config, { version }) => {
  const addFullStoryMavenRepo = (projectBuildGradle) => {
    return mergeContents({
      tag: `@fullstory/react-native repositories`,
      src: projectBuildGradle,
      newSrc: "maven { url 'https://maven.fullstory.com' }",
      anchor: /repositories/,
      offset: 1,
      comment: "//",
    }).contents;
  };

  const addFullStoryProjectDependency = (projectBuildGradle) => {
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
      WarningAggregator.addWarningAndroid(
        "withFullStory",
        "Cannot automatically configure app build.gradle if it's not groovy"
      );
      return { modResults, ...config };
    }

    modResults.contents = addFullStoryProjectDependency(modResults.contents);
    modResults.contents = addFullStoryMavenRepo(modResults.contents);
    return { modResults, ...config };
  });
};

const withAppBuildGradleDelegate = (
  config,
  { org, host, logLevel, enabledVariants }
) => {
  const addFullStoryGradlePlugin = (appBuildGradle) => {
    return mergeContents({
      tag: `@fullstory/react-native plugin`,
      src: appBuildGradle,
      newSrc: `apply plugin: 'fullstory'
        fullstory {
            org '${org}'
            server ${host ? `'https://${host}'` : ""}
            logLevel '${logLevel}'
            enabledVariants '${enabledVariants}'
        }`,
      anchor: /./,
      offset: 1,
      comment: "//",
    }).contents;
  };

  return withAppBuildGradle(config, ({ modResults, ...config }) => {
    if (modResults.language !== "groovy") {
      WarningAggregator.addWarningAndroid(
        "withFullStory",
        `Cannot automatically configure app build.gradle if it's not groovy`
      );
      return { modResults, ...config };
    }

    modResults.contents = addFullStoryGradlePlugin(modResults.contents);
    return { modResults, ...config };
  });
};

module.exports = (config, pluginConfigs) => {
  return withPlugins(config, [
    [withProjectGradleDelegate, pluginConfigs],
    [withAppBuildGradleDelegate, pluginConfigs],
    [withPermissionsDelegate],
  ]);
};
