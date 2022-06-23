const {
  withDangerousMod,
  withPlugins,
  withXcodeProject,
  withInfoPlist,
  createRunOncePlugin,
} = require("@expo/config-plugins");
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");
const pkg = require("./package.json");

const fs = require("fs");
const path = require("path");

async function readFileAsync(path) {
  return fs.promises.readFile(path, "utf8");
}

async function saveFileAsync(path, content) {
  return fs.promises.writeFile(path, content, "utf8");
}

const withInfoPlistDelegate = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.FullStory = {
      OrgId: "KWH",
      Host: "staging.fullstory.com",
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

const withPodfileDelegate = (config) =>
  withDangerousMod(config, [
    "ios",
    async (config) => {
      function addFullStoryToPodfile(src) {
        return mergeContents({
          tag: "fullstory-support",
          src,
          newSrc:
            "pod 'FullStory', :http => 'https://ios-releases.fullstory.com/fullstory-1.27.1-xcframework.tar.gz'",
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

const withBranchIos = (config) => {
  return withPlugins(config, [
    [withInfoPlistDelegate],
    [withPodfileDelegate],
    [withBuildPhaseDelegate],
  ]);
};

module.exports = createRunOncePlugin(
  (config) => withPlugins(config, [[withBranchIos]]),
  pkg.name,
  pkg.version
);
