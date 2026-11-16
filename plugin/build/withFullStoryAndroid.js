"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFullStoryGradlePlugin = exports.addFullStoryProjectDependency = exports.addFullStoryMavenRepo = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const semver_1 = require("semver");
const { withPermissions } = config_plugins_1.AndroidConfig.Permissions;
const withPermissionsDelegate = config => {
    return withPermissions(config, [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
    ]);
};
const addFullStoryMavenRepo = (projectBuildGradle) => {
    return (0, generateCode_1.mergeContents)({
        tag: `@fullstory/react-native repositories`,
        src: projectBuildGradle,
        newSrc: "maven { url 'https://maven.fullstory.com' }",
        anchor: /repositories/,
        offset: 1,
        comment: '//',
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
        comment: '//',
    }).contents;
};
exports.addFullStoryProjectDependency = addFullStoryProjectDependency;
const withProjectGradleDelegate = (expoConfig, { version }) => {
    return (0, config_plugins_1.withProjectBuildGradle)(expoConfig, ({ modResults, ...config }) => {
        if (modResults.language !== 'groovy') {
            throw new Error('Cannot configure Fullstory in the project gradle because the file is not groovy.');
        }
        modResults.contents = (0, exports.addFullStoryProjectDependency)(modResults.contents, version);
        modResults.contents = (0, exports.addFullStoryMavenRepo)(modResults.contents);
        return { modResults, ...config };
    });
};
function getCustomConfigs(additionalConfigs) {
    let customConfigs = '';
    const androidConfigs = additionalConfigs === null || additionalConfigs === void 0 ? void 0 : additionalConfigs.android;
    if (androidConfigs) {
        for (const key in androidConfigs) {
            customConfigs += `${key} ${typeof androidConfigs[key] === 'string'
                ? `'${androidConfigs[key]}'`
                : `${androidConfigs[key]}`}\n`;
        }
    }
    return customConfigs;
}
const addFullStoryGradlePlugin = (appBuildGradle, { org, host, logLevel, logcatLevel, enabledVariants, recordOnStart, version, additionalConfigs, }) => {
    if (!(0, semver_1.valid)(version)) {
        throw new Error(`Fullstory version is not valid. Version: ${version}`);
    }
    const newSrc = `apply plugin: 'fullstory'
      fullstory {
          org '${org}'
          ${host
        ? (0, semver_1.lt)(version, '1.37.0')
            ? `server 'https://${host}'`
            : `serverUrl 'https://${host}'`
        : ''}
          ${logLevel ? `logLevel '${logLevel}'` : ''}
          ${logcatLevel ? `logcatLevel '${logcatLevel}'` : ''}
          ${enabledVariants ? `enabledVariants '${enabledVariants}'` : ''}
          ${typeof recordOnStart === 'boolean' ? `recordOnStart ${recordOnStart}` : ''}
          ${getCustomConfigs(additionalConfigs)}
      }`;
    return mergeAfterAndroidPlugin(appBuildGradle, newSrc);
};
exports.addFullStoryGradlePlugin = addFullStoryGradlePlugin;
const FULLSTORY_PLUGIN_TAG = '@fullstory/react-native plugin';
const ANDROID_APPLY_PLUGIN = /^\s*apply\s*\(?\s*plugin\s*:\s*["']com\.android\.application["']/;
const PLUGINS_BLOCK_START = /^\s*plugins\s*\{/;
// Blanks out comments and string contents so braces inside them are not counted. Newlines are
// kept, so the result has the same line numbers as the input.
function stripNoise(src) {
    return src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/gm, match => (match.startsWith('/') ? match.replace(/[^\n]/g, '') : '""'));
}
// Returns the index of the line that closes the last `plugins { }` block, or -1.
function findLastPluginsBlockEnd(rawLines) {
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
                }
                else if (ch === '}') {
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
function mergeAfterAndroidPlugin(src, newSrc) {
    const merge = (contents, anchor, offset) => (0, generateCode_1.mergeContents)({
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
    const withoutOurs = (0, generateCode_1.removeContents)({ src, tag: FULLSTORY_PLUGIN_TAG }).contents.split('\n');
    const end = findLastPluginsBlockEnd(withoutOurs);
    if (end >= 0) {
        const head = withoutOurs.slice(0, end + 1).join('\n');
        const tail = withoutOurs.slice(end + 1).join('\n');
        return `${head}\n${merge(tail, /^/, 0)}`;
    }
    throw new Error("@fullstory/react-native: couldn't find `apply plugin: 'com.android.application'` or a " +
        '`plugins { }` block in android/app/build.gradle to anchor the Fullstory Gradle plugin to.' +
        ' Please contact Fullstory support.');
}
const withAppBuildGradleDelegate = (expoConfig, pluginConfigs) => {
    return (0, config_plugins_1.withAppBuildGradle)(expoConfig, ({ modResults, ...config }) => {
        if (modResults.language !== 'groovy') {
            throw new Error('Cannot configure Fullstory in the app gradle because the file is not groovy.');
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
