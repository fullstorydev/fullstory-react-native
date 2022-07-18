"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFullStoryToPodfile = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const fs = require("fs");
const path = require("path");
async function readFileAsync(path) {
    return fs.promises.readFile(path, "utf8");
}
async function saveFileAsync(path, content) {
    return fs.promises.writeFile(path, content, "utf8");
}
const withInfoPlistDelegate = (config, { org, host }) => (0, config_plugins_1.withInfoPlist)(config, (config) => {
    config.modResults.FullStory = {
        OrgId: org,
        Host: host,
    };
    return config;
});
const withBuildPhaseDelegate = (config) => (0, config_plugins_1.withXcodeProject)(config, (config) => {
    const xcodeProject = config.modResults;
    const fullStoryBuildPhase = xcodeProject.pbxItemByComment("Run FullStory Asset Uploader", "PBXShellScriptBuildPhase");
    if (!fullStoryBuildPhase) {
        xcodeProject.addBuildPhase([], "PBXShellScriptBuildPhase", "Run FullStory Asset Uploader", null, {
            shellPath: "/bin/sh",
            shellScript: "${PODS_ROOT}/FullStory/tools/FullStoryCommandLine " +
                "${CONFIGURATION_BUILD_DIR}/${WRAPPER_NAME}",
        });
    }
    return config;
});
function addFullStoryToPodfile(src, version) {
    return (0, generateCode_1.mergeContents)({
        tag: "@fullstory/react-native podfile",
        src,
        newSrc: `pod 'FullStory', :http => 'https://ios-releases.fullstory.com/fullstory-${version}-xcframework.tar.gz'`,
        anchor: /use_expo_modules!/,
        offset: 0,
        comment: "#",
    }).contents;
}
exports.addFullStoryToPodfile = addFullStoryToPodfile;
const withPodfileDelegate = (config, { version }) => (0, config_plugins_1.withDangerousMod)(config, [
    "ios",
    async (config) => {
        const file = path.join(config.modRequest.platformProjectRoot, "Podfile");
        const contents = await readFileAsync(file);
        await saveFileAsync(file, addFullStoryToPodfile(contents, version));
        return config;
    },
]);
const withFullStoryIos = (config, pluginConfigs) => {
    return (0, config_plugins_1.withPlugins)(config, [
        [withInfoPlistDelegate, pluginConfigs],
        [withPodfileDelegate, pluginConfigs],
        withBuildPhaseDelegate,
    ]);
};
exports.default = withFullStoryIos;
