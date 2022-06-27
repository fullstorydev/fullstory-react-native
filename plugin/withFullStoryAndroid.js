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

const withProjectGradleDelegate = (config) => {
  const addFullStoryMavenRepo = (projectBuildGradle) => {
    if (
      projectBuildGradle.includes("maven { url 'https://maven.fullstory.com' }")
    )
      return projectBuildGradle;

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
    if (projectBuildGradle.includes("com.fullstory:gradle-plugin-local:1.27.1"))
      return projectBuildGradle;

    return mergeContents({
      tag: `@fullstory/react-native dependencies`,
      src: projectBuildGradle,
      newSrc: "classpath 'com.fullstory:gradle-plugin-local:1.27.1'",
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

const withAppBuildGradleDelegate = (config) => {
  const addFullStoryGradlePlugin = (appBuildGradle) => {
    if (appBuildGradle.includes("apply plugin: 'fullstory'"))
      return appBuildGradle;

    return mergeContents({
      tag: `@fullstory/react-native plugin`,
      src: appBuildGradle,
      newSrc: `apply plugin: 'fullstory'
        
            fullstory {
                org 'KWH'
                server 'https://staging.fullstory.com'
                logLevel 'log'
                enabledVariants 'all'
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

module.exports = (config) => {
  return withPlugins(config, [
    [withProjectGradleDelegate],
    [withAppBuildGradleDelegate],
    [withPermissionsDelegate],
  ]);
};
