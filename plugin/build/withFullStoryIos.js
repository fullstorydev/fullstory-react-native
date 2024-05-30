"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFullStoryToPodfile = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const fs = require('fs');
const path = require('path');
async function readFileAsync(filePath) {
    return fs.promises.readFile(filePath, 'utf8');
}
async function saveFileAsync(filePath, content) {
    return fs.promises.writeFile(filePath, content, 'utf8');
}
const withInfoPlistDelegate = (expoConfig, { org, host, recordOnStart, includeAssets, workaroundRNSVGCapture, workaroundWKUserContentControllerRemoveAllUserScripts, additionalConfigs, }) => (0, config_plugins_1.withInfoPlist)(expoConfig, config => {
    config.modResults.FullStory = {
        OrgId: org,
        Host: host,
        RecordOnStart: recordOnStart,
        IncludeAssets: includeAssets,
        NeedsWorkaroundRNSVGCapture: workaroundRNSVGCapture,
        NeedsWorkaroundWKUserContentControllerRemoveAllUserScripts: workaroundWKUserContentControllerRemoveAllUserScripts,
        ...additionalConfigs,
    };
    return config;
});
const withBuildPhaseDelegate = expoConfig => (0, config_plugins_1.withXcodeProject)(expoConfig, config => {
    const xcodeProject = config.modResults;
    const fullStoryBuildPhase = xcodeProject.pbxItemByComment('Run FullStory Asset Uploader', 'PBXShellScriptBuildPhase');
    if (!fullStoryBuildPhase) {
        xcodeProject.addBuildPhase([], 'PBXShellScriptBuildPhase', 'Run FullStory Asset Uploader', null, {
            shellPath: '/bin/sh',
            shellScript: '${PODS_ROOT}/FullStory/tools/FullStoryCommandLine ' +
                '${CONFIGURATION_BUILD_DIR}/${WRAPPER_NAME}',
        });
    }
    return config;
});
function addFullStoryToPodfile(src, version) {
    return (0, generateCode_1.mergeContents)({
        tag: '@fullstory/react-native podfile',
        src,
        newSrc: `pod 'FullStory', :http => 'https://ios-releases.fullstory.com/fullstory-${version}-xcframework.tar.gz'`,
        anchor: /use_expo_modules!/,
        offset: 0,
        comment: '#',
    }).contents;
}
exports.addFullStoryToPodfile = addFullStoryToPodfile;
const withPodfileDelegate = (expoConfig, { version }) => (0, config_plugins_1.withDangerousMod)(expoConfig, [
    'ios',
    async (config) => {
        const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
        const contents = await readFileAsync(file);
        await saveFileAsync(file, addFullStoryToPodfile(contents, version));
        return config;
    },
]);
const withFullStoryIos = (expoConfig, pluginConfigs) => {
    return (0, config_plugins_1.withPlugins)(expoConfig, [
        [withInfoPlistDelegate, pluginConfigs],
        [withPodfileDelegate, pluginConfigs],
        withBuildPhaseDelegate,
    ]);
};
exports.default = withFullStoryIos;
