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

async function readFileAsync(path: string) {
  return fs.promises.readFile(path, 'utf8');
}

async function saveFileAsync(path: string, content: string) {
  return fs.promises.writeFile(path, content, 'utf8');
}

const withInfoPlistDelegate: ConfigPlugin<FullStoryIosProps> = (
  config,
  { org, host, recordOnStart },
) =>
  withInfoPlist(config, config => {
    config.modResults.FullStory = {
      OrgId: org,
      Host: host,
      RecordOnStart: recordOnStart,
    };
    return config;
  });

const withBuildPhaseDelegate: ConfigPlugin = config =>
  withXcodeProject(config, config => {
    const xcodeProject = config.modResults;

    const fullStoryBuildPhase = xcodeProject.pbxItemByComment(
      'Run FullStory Asset Uploader',
      'PBXShellScriptBuildPhase',
    );

    if (!fullStoryBuildPhase) {
      xcodeProject.addBuildPhase(
        [],
        'PBXShellScriptBuildPhase',
        'Run FullStory Asset Uploader',
        null,
        {
          shellPath: '/bin/sh',
          shellScript:
            '${PODS_ROOT}/FullStory/tools/FullStoryCommandLine ' +
            '${CONFIGURATION_BUILD_DIR}/${WRAPPER_NAME}',
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

const withPodfileDelegate: ConfigPlugin<FullStoryIosProps> = (config, { version }) =>
  withDangerousMod(config, [
    'ios',
    async config => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      const contents = await readFileAsync(file);
      await saveFileAsync(file, addFullStoryToPodfile(contents, version));
      return config;
    },
  ]);

const withFullStoryIos: ConfigPlugin<FullStoryIosProps> = (config, pluginConfigs) => {
  return withPlugins(config, [
    [withInfoPlistDelegate, pluginConfigs],
    [withPodfileDelegate, pluginConfigs],
    withBuildPhaseDelegate,
  ]);
};

export default withFullStoryIos;
