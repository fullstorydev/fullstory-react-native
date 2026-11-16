import {
  withPlugins,
  withProjectBuildGradle,
  withAppBuildGradle,
  AndroidConfig,
  ConfigPlugin,
} from '@expo/config-plugins';
import { mergeContents, removeContents } from '@expo/config-plugins/build/utils/generateCode';
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
        'Cannot configure Fullstory in the project gradle because the file is not groovy.',
      );
    }

    modResults.contents = addFullStoryProjectDependency(modResults.contents, version);
    modResults.contents = addFullStoryMavenRepo(modResults.contents);
    return { modResults, ...config };
  });
};

function getCustomConfigs(additionalConfigs: FullStoryAndroidProps['additionalConfigs']) {
  let customConfigs = '';
  const androidConfigs = additionalConfigs?.android;

  if (androidConfigs) {
    for (const key in androidConfigs) {
      customConfigs += `${key} ${
        typeof androidConfigs[key] === 'string'
          ? `'${androidConfigs[key]}'`
          : `${androidConfigs[key]}`
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

  const newSrc = `apply plugin: 'fullstory'
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
      }`;

  return mergeAfterAndroidPlugin(appBuildGradle, newSrc);
};

const FULLSTORY_PLUGIN_TAG = '@fullstory/react-native plugin';
const ANDROID_APPLY_PLUGIN = /^\s*apply\s*\(?\s*plugin\s*:\s*["']com\.android\.application["']/;
const PLUGINS_BLOCK_START = /^\s*plugins\s*\{/;

// Blanks out comments and string contents so braces inside them are not counted. Newlines are
// kept, so the result has the same line numbers as the input.
function stripNoise(src: string) {
  return src.replace(
    /\/\*[\s\S]*?\*\/|\/\/.*$|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/gm,
    match => (match.startsWith('/') ? match.replace(/[^\n]/g, '') : '""'),
  );
}

// Returns the index of the line that closes the last `plugins { }` block, or -1.
function findLastPluginsBlockEnd(rawLines: string[]) {
  const lines = stripNoise(rawLines.join('\n')).split('\n');
  let last = -1;
  for (let i = 0; i < lines.length; i++) {
    if (!PLUGINS_BLOCK_START.test(lines[i])) {
      continue;
    }
    let depth = 0;
    for (let j = i; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if (ch === '{') {
          depth++;
        } else if (ch === '}') {
          depth--;
        }
      }
      if (depth === 0) {
        last = j;
        i = j;
        break;
      }
    }
  }
  return last;
}

/**
 * Inserts our block after the Android application plugin is applied, so it never lands inside
 * (or ahead of) another plugin's `plugins {}` block regardless of what else has modified the file.
 *
 * 1. `apply plugin: 'com.android.application'` -> insert after that line.
 * 2. Only `plugins { id("com.android.application") }` -> insert after the last `plugins {}` block
 *    (Gradle requires every `plugins {}` block to come before any other statement).
 * 3. Otherwise throw rather than guess a position that could produce an invalid build file.
 */
function mergeAfterAndroidPlugin(src: string, newSrc: string) {
  const merge = (contents: string, anchor: RegExp, offset: number) =>
    mergeContents({
      tag: FULLSTORY_PLUGIN_TAG,
      src: contents,
      newSrc,
      anchor,
      offset,
      comment: '//',
    }).contents;

  const lines = src.split('\n');

  if (lines.some(line => ANDROID_APPLY_PLUGIN.test(line))) {
    return merge(src, ANDROID_APPLY_PLUGIN, 1);
  }

  // mergeContents below only sees the text after the `plugins {}` block, so remove any existing
  // Fullstory block from the whole file first; otherwise one before the block would be duplicated.
  const withoutOurs = removeContents({ src, tag: FULLSTORY_PLUGIN_TAG }).contents.split('\n');
  const end = findLastPluginsBlockEnd(withoutOurs);
  if (end >= 0) {
    const head = withoutOurs.slice(0, end + 1).join('\n');
    const tail = withoutOurs.slice(end + 1).join('\n');
    return `${head}\n${merge(tail, /^/, 0)}`;
  }

  throw new Error(
    "@fullstory/react-native: couldn't find `apply plugin: 'com.android.application'` or a " +
      '`plugins { }` block in android/app/build.gradle to anchor the Fullstory Gradle plugin to.' +
      ' Please contact Fullstory support.',
  );
}

const withAppBuildGradleDelegate: ConfigPlugin<FullStoryAndroidProps> = (
  expoConfig,
  pluginConfigs,
) => {
  return withAppBuildGradle(expoConfig, ({ modResults, ...config }) => {
    if (modResults.language !== 'groovy') {
      throw new Error(
        'Cannot configure Fullstory in the app gradle because the file is not groovy.',
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
