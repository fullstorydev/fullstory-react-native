const {
  withDangerousMod,
  withPlugins,
  withXcodeProject,
  withInfoPlist,
} = require("@expo/config-plugins");
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");
const fs = require("fs");
const path = require("path");

async function readFileAsync(path) {
  return fs.promises.readFile(path, "utf8");
}

async function saveFileAsync(path, content) {
  return fs.promises.writeFile(path, content, "utf8");
}

const withInfoPlistDelegate = (config, { org, host }) =>
  withInfoPlist(config, (config) => {
    config.modResults.FullStory = {
      OrgId: org,
      Host: host,
    };
    return config;
  });

const withBuildPhaseDelegate = (config) =>
  withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;

    const fullStoryBuildPhase = xcodeProject.pbxItemByComment(
      "Run FullStory Asset Uploader",
      "PBXShellScriptBuildPhase"
    );

    if (!fullStoryBuildPhase) {
      xcodeProject.addBuildPhase(
        [],
        "PBXShellScriptBuildPhase",
        "Run FullStory Asset Uploader",
        null,
        {
          shellPath: "/bin/sh",
          shellScript:
            "${PODS_ROOT}/FullStory/tools/FullStoryCommandLine " +
            "${CONFIGURATION_BUILD_DIR}/${WRAPPER_NAME}",
        }
      );
    }

    return config;
  });

const withPodfileDelegate = (config, { version }) =>
  withDangerousMod(config, [
    "ios",
    async (config) => {
      function addFullStoryToPodfile(src) {
        return mergeContents({
          tag: "@fullstory/react-native",
          src,
          newSrc: `pod 'FullStory', :http => 'https://ios-releases.fullstory.com/fullstory-${version}-xcframework.tar.gz'`,
          anchor: /use_expo_modules!/,
          offset: 0,
          comment: "#",
        }).contents;
      }

      const file = path.join(config.modRequest.platformProjectRoot, "Podfile");
      const contents = await readFileAsync(file);
      await saveFileAsync(file, addFullStoryToPodfile(contents));
      return config;
    },
  ]);

module.exports = (config, pluginConfigs) => {
  return withPlugins(config, [
    [withInfoPlistDelegate, pluginConfigs],
    [withPodfileDelegate, pluginConfigs],
    [withBuildPhaseDelegate],
  ]);
};
