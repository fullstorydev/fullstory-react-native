"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFullStoryGradlePlugin = exports.addFullStoryProjectDependency = exports.addFullStoryMavenRepo = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const { withPermissions } = config_plugins_1.AndroidConfig.Permissions;
const withPermissionsDelegate = (config) => {
    return withPermissions(config, [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
    ]);
};
const addFullStoryMavenRepo = (projectBuildGradle) => {
    return (0, generateCode_1.mergeContents)({
        tag: `@fullstory/react-native repositories`,
        src: projectBuildGradle,
        newSrc: "maven { url 'https://maven.fullstory.com' }",
        anchor: /repositories/,
        offset: 1,
        comment: "//",
    }).contents;
};
exports.addFullStoryMavenRepo = addFullStoryMavenRepo;
const addFullStoryProjectDependency = (projectBuildGradle, version) => {
    return (0, generateCode_1.mergeContents)({
        tag: `@fullstory/react-native dependencies`,
        src: projectBuildGradle,
        newSrc: `classpath 'com.fullstory:gradle-plugin-local:${version}'`,
        anchor: /dependencies/,
        offset: 1,
        comment: "//",
    }).contents;
};
exports.addFullStoryProjectDependency = addFullStoryProjectDependency;
const withProjectGradleDelegate = (config, { version }) => {
    return (0, config_plugins_1.withProjectBuildGradle)(config, ({ modResults, ...config }) => {
        if (modResults.language !== "groovy") {
            throw new Error("Cannot configure FullStory in the project gradle because the file is not groovy.");
        }
        modResults.contents = (0, exports.addFullStoryProjectDependency)(modResults.contents, version);
        modResults.contents = (0, exports.addFullStoryMavenRepo)(modResults.contents);
        return { modResults, ...config };
    });
};
const addFullStoryGradlePlugin = (appBuildGradle, { org, host, logLevel, enabledVariants }) => {
    return (0, generateCode_1.mergeContents)({
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
exports.addFullStoryGradlePlugin = addFullStoryGradlePlugin;
const withAppBuildGradleDelegate = (config, pluginConfigs) => {
    return (0, config_plugins_1.withAppBuildGradle)(config, ({ modResults, ...config }) => {
        if (modResults.language !== "groovy") {
            throw new Error("Cannot configure FullStory in the app gradle because the file is not groovy.");
        }
        modResults.contents = (0, exports.addFullStoryGradlePlugin)(modResults.contents, pluginConfigs);
        return { modResults, ...config };
    });
};
const withFullStoryAndroid = (config, pluginConfigs) => {
    return (0, config_plugins_1.withPlugins)(config, [
        [withProjectGradleDelegate, pluginConfigs],
        [withAppBuildGradleDelegate, pluginConfigs],
        withPermissionsDelegate,
    ]);
};
exports.default = withFullStoryAndroid;
