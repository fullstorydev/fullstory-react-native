import {
  withDangerousMod,
  withPlugins,
  withXcodeProject,
  withInfoPlist,
  ConfigPlugin,
} from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

import { FullStoryIosProps } from '.';

const fs = require('fs');
const path = require('path');

async function readFileAsync(filePath: string) {
  return fs.promises.readFile(filePath, 'utf8');
}

async function saveFileAsync(filePath: string, content: string) {
  return fs.promises.writeFile(filePath, content, 'utf8');
}

const withInfoPlistDelegate: ConfigPlugin<FullStoryIosProps> = (
  expoConfig,
  {
    org,
    host,
    recordOnStart,
    includeAssets,
    workaroundRNSVGCapture,
    workaroundWKUserContentControllerRemoveAllUserScripts,
    additionalConfigs,
  },
) =>
  withInfoPlist(expoConfig, config => {
    config.modResults.FullStory = {
      OrgId: org,
      Host: host,
      RecordOnStart: recordOnStart,
      IncludeAssets: includeAssets,
      NeedsWorkaroundRNSVGCapture: workaroundRNSVGCapture,
      NeedsWorkaroundWKUserContentControllerRemoveAllUserScripts:
        workaroundWKUserContentControllerRemoveAllUserScripts,
      ...additionalConfigs?.ios,
    };
    return config;
  });

const withBuildPhaseDelegate: ConfigPlugin<FullStoryIosProps> = (expoConfig, { infoPlistPath }) =>
  withXcodeProject(expoConfig, config => {
    const xcodeProject = config.modResults;

    const fullStoryBuildPhase = xcodeProject.pbxItemByComment(
      'Run FullStory Asset Uploader',
      'PBXShellScriptBuildPhase',
    );

    if (!fullStoryBuildPhase) {
      let shellScript =
        '${PODS_ROOT}/FullStory/tools/FullStoryCommandLine ' +
        '${CONFIGURATION_BUILD_DIR}/${WRAPPER_NAME}';

      if (infoPlistPath) {
        shellScript += ` "${infoPlistPath}"`;
      }

      xcodeProject.addBuildPhase(
        [],
        'PBXShellScriptBuildPhase',
        'Run FullStory Asset Uploader',
        null,
        {
          shellPath: '/bin/sh',
          shellScript,
        },
      );
    }

    return config;
  });

export function addFullStoryToPodfile(src: string, version: string) {
  return mergeContents({
    tag: '@fullstory/react-native podfile',
    src,
    newSrc: `pod 'FullStory', :http => 'https://ios-releases.fullstory.com/fullstory-${version}-xcframework.tar.gz'`,
    anchor: /use_expo_modules!/,
    offset: 0,
    comment: '#',
  }).contents;
}

const withPodfileDelegate: ConfigPlugin<FullStoryIosProps> = (expoConfig, { version }) =>
  withDangerousMod(expoConfig, [
    'ios',
    async config => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      const contents = await readFileAsync(file);
      await saveFileAsync(file, addFullStoryToPodfile(contents, version));
      return config;
    },
  ]);

const withFullStoryIos: ConfigPlugin<FullStoryIosProps> = (expoConfig, pluginConfigs) => {
  return withPlugins(expoConfig, [
    [withInfoPlistDelegate, pluginConfigs],
    [withPodfileDelegate, pluginConfigs],
    [withBuildPhaseDelegate, pluginConfigs],
  ]);
};

export default withFullStoryIos;
