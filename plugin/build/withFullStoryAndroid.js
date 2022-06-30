"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const { withPermissions } = config_plugins_1.AndroidConfig.Permissions;
const withPermissionsDelegate = (config) => {
    return withPermissions(config, [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
    ]);
};
const withProjectGradleDelegate = (config, { version }) => {
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
    const addFullStoryProjectDependency = (projectBuildGradle) => {
        return (0, generateCode_1.mergeContents)({
            tag: `@fullstory/react-native dependencies`,
            src: projectBuildGradle,
            newSrc: `classpath 'com.fullstory:gradle-plugin-local:${version}'`,
            anchor: /dependencies/,
            offset: 1,
            comment: "//",
        }).contents;
    };
    return (0, config_plugins_1.withProjectBuildGradle)(config, ({ modResults, ...config }) => {
        if (modResults.language !== "groovy") {
            throw new Error("Cannot configure FullStory in the project gradle because the file is not groovy.");
        }
        modResults.contents = addFullStoryProjectDependency(modResults.contents);
        modResults.contents = addFullStoryMavenRepo(modResults.contents);
        return { modResults, ...config };
    });
};
const withAppBuildGradleDelegate = (config, { org, host, logLevel, enabledVariants }) => {
    const addFullStoryGradlePlugin = (appBuildGradle) => {
        return (0, generateCode_1.mergeContents)({
            tag: `@fullstory/react-native plugin`,
            src: appBuildGradle,
            newSrc: `apply plugin: 'fullstory'
        fullstory {
            org '${org}'
            server ${host ? `'https://${host}'` : ""}
            logLevel ${logLevel ? `'${logLevel}'` : ""}
            enabledVariants ${enabledVariants ? `'${enabledVariants}'` : ""}
        }`,
            anchor: /./,
            offset: 1,
            comment: "//",
        }).contents;
    };
    return (0, config_plugins_1.withAppBuildGradle)(config, ({ modResults, ...config }) => {
        if (modResults.language !== "groovy") {
            throw new Error("Cannot configure FullStory in the app gradle because the file is not groovy.");
        }
        modResults.contents = addFullStoryGradlePlugin(modResults.contents);
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
