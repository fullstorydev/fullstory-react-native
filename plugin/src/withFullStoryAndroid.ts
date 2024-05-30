import {
  withPlugins,
  withProjectBuildGradle,
  withAppBuildGradle,
  AndroidConfig,
  ConfigPlugin,
} from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
import { valid, lt } from 'semver';

import { FullStoryAndroidProps } from '.';

const { withPermissions } = AndroidConfig.Permissions;

const withPermissionsDelegate: ConfigPlugin = config => {
  return withPermissions(config, [
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
  ]);
};

export const addFullStoryMavenRepo = (projectBuildGradle: string) => {
  return mergeContents({
    tag: `@fullstory/react-native repositories`,
    src: projectBuildGradle,
    newSrc: "maven { url 'https://maven.fullstory.com' }",
    anchor: /repositories/,
    offset: 1,
    comment: '//',
  }).contents;
};

export const addFullStoryProjectDependency = (projectBuildGradle: string, version: string) => {
  return mergeContents({
    tag: `@fullstory/react-native dependencies`,
    src: projectBuildGradle,
    newSrc: `classpath 'com.fullstory:gradle-plugin-local:${version}'`,
    anchor: /dependencies/,
    offset: 1,
    comment: '//',
  }).contents;
};

const withProjectGradleDelegate: ConfigPlugin<FullStoryAndroidProps> = (
  expoConfig,
  { version },
) => {
  return withProjectBuildGradle(expoConfig, ({ modResults, ...config }) => {
    if (modResults.language !== 'groovy') {
      throw new Error(
        'Cannot configure FullStory in the project gradle because the file is not groovy.',
      );
    }

    modResults.contents = addFullStoryProjectDependency(modResults.contents, version);
    modResults.contents = addFullStoryMavenRepo(modResults.contents);
    return { modResults, ...config };
  });
};

function getCustomConfigs(additionalConfigs: FullStoryAndroidProps['additionalConfigs']) {
  let customConfigs = '';

  if (additionalConfigs) {
    for (const key in additionalConfigs) {
      customConfigs += `${key} ${
        typeof additionalConfigs[key] === 'string'
          ? `'${additionalConfigs[key]}'`
          : `${additionalConfigs[key]}`
      }\n`;
    }
  }

  return customConfigs;
}

export const addFullStoryGradlePlugin = (
  appBuildGradle: string,
  {
    org,
    host,
    logLevel,
    logcatLevel,
    enabledVariants,
    recordOnStart,
    version,
    additionalConfigs,
  }: FullStoryAndroidProps,
) => {
  if (!valid(version)) {
    throw new Error(`Fullstory version is not valid. Version: ${version}`);
  }

  return mergeContents({
    tag: `@fullstory/react-native plugin`,
    src: appBuildGradle,
    newSrc: `apply plugin: 'fullstory'
      fullstory {
          org '${org}'
          ${
            host
              ? lt(version, '1.37.0')
                ? `server 'https://${host}'`
                : `serverUrl 'https://${host}'`
              : ''
          }
          ${logLevel ? `logLevel '${logLevel}'` : ''}
          ${logcatLevel ? `logcatLevel '${logcatLevel}'` : ''}
          ${enabledVariants ? `enabledVariants '${enabledVariants}'` : ''}
          ${typeof recordOnStart === 'boolean' ? `recordOnStart ${recordOnStart}` : ''}
          ${getCustomConfigs(additionalConfigs)}
      }`,
    anchor: /./,
    offset: 1,
    comment: '//',
  }).contents;
};

const withAppBuildGradleDelegate: ConfigPlugin<FullStoryAndroidProps> = (
  expoConfig,
  pluginConfigs,
) => {
  return withAppBuildGradle(expoConfig, ({ modResults, ...config }) => {
    if (modResults.language !== 'groovy') {
      throw new Error(
        'Cannot configure FullStory in the app gradle because the file is not groovy.',
      );
    }

    modResults.contents = addFullStoryGradlePlugin(modResults.contents, pluginConfigs);
    return { modResults, ...config };
  });
};

const withFullStoryAndroid: ConfigPlugin<FullStoryAndroidProps> = (config, pluginConfigs) => {
  return withPlugins(config, [
    [withProjectGradleDelegate, pluginConfigs],
    [withAppBuildGradleDelegate, pluginConfigs],
    withPermissionsDelegate,
  ]);
};

export default withFullStoryAndroid;
